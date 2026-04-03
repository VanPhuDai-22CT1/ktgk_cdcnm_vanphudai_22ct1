import React, { useState, useEffect } from 'react';

function App() {
  const [currentView, setCurrentView] = useState('DASHBOARD');
  const [notification, setNotification] = useState({ visible: false, text: '', isError: false });

  const [inventoryList, setInventoryList] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [studentProfile, setStudentProfile] = useState(null);

  const [newItemName, setNewItemName] = useState('');
  const [editTargetId, setEditTargetId] = useState(null);
  const [editItemName, setEditItemName] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api';

  const triggerAlert = (text, isError = false) => {
    setNotification({ visible: true, text, isError });
    setTimeout(() => setNotification({ visible: false, text: '', isError: false }), 3000);
  };

  const loadInventoryData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error('Lỗi kết nối');
      const data = await response.json();
      setInventoryList(data);
    } catch (error) {
      triggerAlert('Không thể tải danh sách sản phẩm', true);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      const data = await response.json();
      setTotalItems(data.total || data[0]?.total || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const loadProfileInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/about`);
      const data = await response.json();
      setStudentProfile(data);
    } catch (error) {
      triggerAlert('Không thể tải thông tin sinh viên', true);
    }
  };

  useEffect(() => {
    loadInventoryData();
    loadStatistics();
    loadProfileInfo();
  }, []);

  const createNewItem = async () => {
    if (!newItemName.trim()) return;
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItemName })
      });
      if (!response.ok) throw new Error('Lỗi');
      
      triggerAlert('Đã thêm sản phẩm mới!');
      setNewItemName('');
      loadInventoryData();
      loadStatistics();
    } catch (error) {
      triggerAlert('Thêm thất bại. Kiểm tra server!', true);
    }
  };

  const removeSpecificItem = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa mục này?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Lỗi');
      
      triggerAlert('Đã xóa thành công!');
      loadInventoryData();
      loadStatistics();
    } catch (error) {
      triggerAlert('Xóa thất bại!', true);
    }
  };

  const saveUpdatedItem = async () => {
    if (!editItemName.trim() || !editTargetId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/products/${editTargetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editItemName })
      });
      if (!response.ok) throw new Error('Lỗi');
      
      triggerAlert('Cập nhật dữ liệu thành công!');
      setEditTargetId(null);
      loadInventoryData();
    } catch (error) {
      triggerAlert('Lỗi cập nhật!', true);
    }
  };

  return (
    <div className="app-container">
      <style>{`
        * { box-sizing: border-box; font-family: 'Inter', system-ui, sans-serif; }
        html, body, #root { margin: 0; padding: 0; height: 100%; width: 100%; background-color: #f1f5f9; color: #334155; overflow: hidden; }
        .app-container { display: flex; height: 100vh; width: 100vw; }
        
        .sidebar { width: 260px; height: 100%; background-color: #0f172a; color: #f8fafc; padding: 2rem 1rem; display: flex; flex-direction: column; gap: 0.5rem; flex-shrink: 0; }
        .brand-logo { font-size: 1.5rem; font-weight: 800; text-align: center; margin-bottom: 2rem; color: #38bdf8; letter-spacing: 1px; }
        .menu-btn { background: transparent; color: #cbd5e1; border: none; padding: 1rem; text-align: left; border-radius: 8px; cursor: pointer; font-size: 1rem; transition: 0.3s; display: flex; align-items: center; gap: 10px; }
        .menu-btn:hover { background-color: #1e293b; color: #fff; }
        .menu-btn.active { background-color: #38bdf8; color: #0f172a; font-weight: 600; }
        
        .main-content { flex: 1; height: 100%; padding: 2.5rem 3rem; overflow-y: auto; }
        .header-title { font-size: 2rem; font-weight: 700; margin-top: 0; margin-bottom: 2rem; color: #0f172a; }
        
        .stat-box { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border-left: 6px solid #38bdf8; display: inline-block; min-width: 250px; margin-bottom: 2rem; }
        .stat-label { font-size: 0.875rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
        .stat-value { font-size: 2.5rem; font-weight: 800; color: #0f172a; margin: 0.5rem 0 0 0; }
        
        .action-bar { display: flex; gap: 1rem; margin-bottom: 2rem; background: white; padding: 1rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        .custom-input { flex: 1; padding: 0.75rem 1rem; border: 2px solid #e2e8f0; border-radius: 8px; outline: none; font-size: 1rem; transition: 0.2s; }
        .custom-input:focus { border-color: #38bdf8; }
        .primary-btn { background-color: #38bdf8; color: #0f172a; font-weight: 700; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; transition: 0.2s; }
        .primary-btn:hover { background-color: #0284c7; color: white; }
        
        .inventory-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .item-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); position: relative; transition: transform 0.2s; border: 1px solid #e2e8f0; }
        .item-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
        .item-id { position: absolute; top: 1rem; right: 1rem; background: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; color: #64748b; }
        .item-name { font-size: 1.25rem; font-weight: 600; color: #1e293b; margin: 0 0 1.5rem 0; padding-right: 3rem; word-wrap: break-word; }
        .item-actions { display: flex; gap: 0.5rem; }
        .btn-edit { background: #fef08a; color: #854d0e; padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; flex: 1; }
        .btn-delete { background: #fecdd3; color: #9f1239; padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; flex: 1; }
        
        .toast { position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 1.5rem; border-radius: 8px; font-weight: 600; color: white; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.2); z-index: 50; animation: popUp 0.3s ease-out; }
        .toast.success { background-color: #10b981; }
        .toast.error { background-color: #ef4444; }
        @keyframes popUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .profile-card { background: white; padding: 2.5rem; border-radius: 16px; box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1); width: 100%; max-width: 500px; margin: 0 auto; }
        .profile-line { display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px dashed #e2e8f0; }
        .profile-line:last-child { border-bottom: none; }
        .profile-label { color: #64748b; font-weight: 600; }
        .profile-info { font-weight: 700; color: #0f172a; text-align: right; }

        .api-link-btn { display: inline-flex; align-items: center; gap: 10px; background: #8b5cf6; color: white; text-decoration: none; padding: 1rem 2rem; border-radius: 12px; font-size: 1.25rem; font-weight: 700; transition: 0.3s; box-shadow: 0 4px 6px -1px rgb(139 92 246 / 0.5); }
        .api-link-btn:hover { background: #7c3aed; transform: scale(1.05); }
      `}</style>

      <nav className="sidebar">
        <div className="brand-logo">NONG_SAN API</div>
        <button 
          className={`menu-btn ${currentView === 'DASHBOARD' ? 'active' : ''}`} 
          onClick={() => setCurrentView('DASHBOARD')}
        >
          📦 Quản lý Kho
        </button>
        <button 
          className={`menu-btn ${currentView === 'PROFILE' ? 'active' : ''}`} 
          onClick={() => setCurrentView('PROFILE')}
        >
          🎓 Sinh viên
        </button>
        <button 
          className={`menu-btn ${currentView === 'NETWORK' ? 'active' : ''}`} 
          onClick={() => setCurrentView('NETWORK')}
        >
          ⚡ Kết nối API
        </button>
      </nav>

      <main className="main-content">
        {currentView === 'DASHBOARD' && (
          <div>
            <h1 className="header-title">Danh sách Hàng hóa</h1>
            
            <div className="stat-box">
              <div className="stat-label">Tổng dữ liệu đã lưu</div>
              <p className="stat-value">{totalItems}</p>
            </div>

            <div className="action-bar">
              <input 
                type="text" 
                className="custom-input" 
                placeholder="Nhập tên sản phẩm để đưa vào hệ thống..." 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createNewItem()}
              />
              <button className="primary-btn" onClick={createNewItem}>Lưu Dữ Liệu</button>
            </div>

            <div className="inventory-grid">
              {inventoryList.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
                  Kho hàng đang trống. Hãy nhập sản phẩm đầu tiên!
                </div>
              ) : (
                inventoryList.map((item) => (
                  <div key={item.id} className="item-card">
                    <span className="item-id">ID: {item.id}</span>
                    
                    {editTargetId === item.id ? (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <input 
                          className="custom-input" 
                          style={{ width: '100%', marginBottom: '0.5rem' }}
                          value={editItemName} 
                          onChange={(e) => setEditItemName(e.target.value)}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <h3 className="item-name">{item.name}</h3>
                    )}

                    <div className="item-actions">
                      {editTargetId === item.id ? (
                        <>
                          <button className="btn-edit" onClick={saveUpdatedItem} style={{ background: '#4ade80', color: '#14532d' }}>Xong</button>
                          <button className="btn-delete" onClick={() => setEditTargetId(null)}>Hủy</button>
                        </>
                      ) : (
                        <>
                          <button className="btn-edit" onClick={() => { setEditTargetId(item.id); setEditItemName(item.name); }}>Sửa</button>
                          <button className="btn-delete" onClick={() => removeSpecificItem(item.id)}>Xóa</button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {currentView === 'PROFILE' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '2rem' }}>
            <h1 className="header-title" style={{ textAlign: 'center' }}>Hồ sơ Sinh viên</h1>
            {studentProfile ? (
              <div className="profile-card">
                <div className="profile-line">
                  <span className="profile-label">Họ và tên</span>
                  <span className="profile-info">{studentProfile.fullname}</span>
                </div>
                <div className="profile-line">
                  <span className="profile-label">Lớp học</span>
                  <span className="profile-info">{studentProfile.class_name}</span>
                </div>
                <div className="profile-line">
                  <span className="profile-label">Mã số sinh viên</span>
                  <span className="profile-info">{studentProfile.student_id}</span>
                </div>
                <div className="profile-line">
                  <span className="profile-label">Tên dự án</span>
                  <span className="profile-info" style={{ color: '#38bdf8' }}>{studentProfile.project_name}</span>
                </div>
                <div className="profile-line">
                  <span className="profile-label">Môn học</span>
                  <span className="profile-info">{studentProfile.subject_name}</span>
                </div>
              </div>
            ) : (
              <p style={{ color: '#94a3b8' }}>Đang kết nối database để lấy dữ liệu...</p>
            )}
          </div>
        )}

        {currentView === 'NETWORK' && (
          <div style={{ textAlign: 'center', paddingTop: '5rem' }}>
            <h1 className="header-title" style={{ marginBottom: '3rem' }}>Truy cập Endpoint Backend</h1>
            <a 
              href="http://localhost:5000/health" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="api-link-btn"
            >
              🌐 Mở trang Health Check API
            </a>
            <p style={{ marginTop: '2rem', color: '#64748b' }}>
              Nhấp vào nút trên để mở cổng API trực tiếp trên trình duyệt ở tab mới.
            </p>
          </div>
        )}
      </main>

      {notification.visible && (
        <div className={`toast ${notification.isError ? 'error' : 'success'}`}>
          {notification.isError ? '⚠️ ' : '✅ '} {notification.text}
        </div>
      )}
    </div>
  );
}

export default App;