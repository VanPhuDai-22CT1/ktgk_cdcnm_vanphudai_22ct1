const express = require('express');
const cors = require('cors');
const { createPool } = require('mysql2/promise');
require('dotenv').config();

const apiServer = express();
apiServer.use(cors());
apiServer.use(express.json());
apiServer.use(express.urlencoded({ extended: true }));

const dbPool = createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'demo_database',
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4'
});

const systemState = {
    isOnline: true
};

apiServer.post('/api/toggle-health', (req, res) => {
    systemState.isOnline = !systemState.isOnline;
    console.warn(`[MONITOR] Server Status Changed: ${systemState.isOnline ? 'UP' : 'DOWN'}`);
    return res.status(200).json({ isHealthy: systemState.isOnline });
});

apiServer.get('/health', (req, res) => {
    return systemState.isOnline 
        ? res.status(200).json({ status: "ok" })
        : res.status(503).json({ status: "error", message: "Bảo trì hệ thống!" });
});

const verifySystemStatus = (req, res, next) => {
    if (!systemState.isOnline) {
        return res.status(503).json({ error: "Yêu cầu bị từ chối: Máy chủ hiện không khả dụng!" });
    }
    next();
};

apiServer.use('/api', verifySystemStatus);

apiServer.get('/api/about', async (req, res) => {
    try {
        const [rows] = await dbPool.execute('SELECT * FROM academic_records LIMIT 1');
        return res.status(200).json(rows[0] || {});
    } catch (error) {
        return res.status(500).json({ error: "Lỗi truy xuất dữ liệu", detail: error.message });
    }
});

apiServer.get('/api/stats', async (req, res) => {
    try {
        const [rows] = await dbPool.execute('SELECT COUNT(id) AS total FROM inventory_items');
        return res.status(200).json(rows[0]);
    } catch (error) {
        return res.status(500).json({ error: "Lỗi thống kê", detail: error.message });
    }
});

apiServer.get('/api/products', async (req, res) => {
    try {
        const keyword = req.query.search ? `%${req.query.search}%` : '%%';
        const queryStr = `
            SELECT * FROM inventory_items 
            WHERE name LIKE ? OR CAST(id AS CHAR) LIKE ? 
            ORDER BY id DESC
        `;
        const [records] = await dbPool.execute(queryStr, [keyword, keyword]);
        return res.status(200).json(records);
    } catch (error) {
        return res.status(500).json({ error: "Lỗi truy vấn danh sách", detail: error.message });
    }
});

apiServer.post('/api/products', async (req, res) => {
    try {
        const { name } = req.body;
        const [insertData] = await dbPool.execute(
            'INSERT INTO inventory_items (name) VALUES (?)', 
            [name]
        );
        return res.status(201).json({ id: insertData.insertId, name });
    } catch (error) {
        return res.status(500).json({ error: "Lỗi thêm mới", detail: error.message });
    }
});

apiServer.put('/api/products/:id', async (req, res) => {
    try {
        const targetId = req.params.id;
        const newName = req.body.name;
        await dbPool.execute(
            'UPDATE inventory_items SET name = ? WHERE id = ?', 
            [newName, targetId]
        );
        return res.status(200).json({ message: "Cập nhật dữ liệu thành công" });
    } catch (error) {
        return res.status(500).json({ error: "Lỗi cập nhật", detail: error.message });
    }
});

apiServer.delete('/api/products/:id', async (req, res) => {
    try {
        const targetId = req.params.id;
        await dbPool.execute(
            'DELETE FROM inventory_items WHERE id = ?', 
            [targetId]
        );
        return res.status(200).json({ message: "Xóa dữ liệu thành công" });
    } catch (error) {
        return res.status(500).json({ error: "Lỗi thao tác xóa", detail: error.message });
    }
});

const LISTENING_PORT = process.env.PORT || 5000;
apiServer.listen(LISTENING_PORT, () => {
    console.log(`[READY] API Gateway đang chạy tại cổng: ${LISTENING_PORT}`);
});