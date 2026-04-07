import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import imageCompression from 'browser-image-compression';
import Swal from 'sweetalert2';

const AdminChat = () => {
  const { user } = useAuth();
  const [chatUsers, setChatUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://192.168.1.12:5000/api/admin/chat-users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Lọc bỏ những user đã bị xóa khỏi Database
      const validUsers = res.data.filter(u => u._id !== null && u._id !== undefined);
      setChatUsers(validUsers);
    } catch (err) { console.log("Lỗi tải danh sách user", err); }
  };

  const fetchMessages = async () => {
    if (!activeUser || !activeUser._id) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://192.168.1.12:5000/api/chat?userId=${activeUser._id._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(() => {
      fetchUsers();
      fetchMessages();
    }, 3000);
    return () => clearInterval(interval);
  }, [activeUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!text.trim() || !activeUser || !activeUser._id) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://192.168.1.12:5000/api/chat', 
        { userId: activeUser._id._id, text }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages([...messages, res.data]);
      setText('');
    } catch (err) { console.log(err); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeUser || !activeUser._id) return;
    
    setUploading(true);
    let attachmentUrl = '';
    let attachmentType = file.type.startsWith('image/') ? 'image' : 'file';

    try {
      if (attachmentType === 'image') {
        const options = { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true };
        const compressedFile = await imageCompression(file, options);
        attachmentUrl = await toBase64(compressedFile);
      } else {
        if (file.size > 2 * 1024 * 1024) {
          Swal.fire('Lỗi', 'Chỉ hỗ trợ gửi tệp đính kèm dưới 2MB!', 'warning');
          setUploading(false); return;
        }
        attachmentUrl = await toBase64(file);
      }

      const token = localStorage.getItem('token');
      const res = await axios.post('http://192.168.1.12:5000/api/chat', { 
        userId: activeUser._id._id,
        text: `Đã gửi 1 ${attachmentType === 'image' ? 'hình ảnh' : 'tệp đính kèm'}`, 
        attachmentUrl, attachmentType 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setMessages([...messages, res.data]);
    } catch (err) { console.log("Lỗi upload", err); }
    finally { setUploading(false); e.target.value = null; }
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const handleDeleteChat = () => {
    if (!activeUser || !activeUser._id) return;
    Swal.fire({
      title: 'Xóa toàn bộ tin nhắn?',
      text: "Hành động này không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Đồng ý Xóa'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://192.168.1.12:5000/api/admin/chat/${activeUser._id._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMessages([]);
          Swal.fire('Đã xóa!', 'Đoạn chat đã được dọn sạch.', 'success');
        } catch (err) { Swal.fire('Lỗi', 'Không thể xóa đoạn chat', 'error'); }
      }
    });
  };

  const handleBlockUser = async () => {
    if (!activeUser || !activeUser._id) return;
    const isCurrentlyBlocked = activeUser._id.isBlocked;
    const actionText = isCurrentlyBlocked ? 'Mở chặn' : 'Chặn';
    
    Swal.fire({
      title: `${actionText} người dùng này?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: isCurrentlyBlocked ? '#28a745' : '#dc3545',
      confirmButtonText: `Đồng ý ${actionText}`
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.put(`http://192.168.1.12:5000/api/admin/users/${activeUser._id._id}/block`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setActiveUser({
            ...activeUser,
            _id: { ...activeUser._id, isBlocked: res.data.isBlocked }
          });
          
          Swal.fire('Thành công!', res.data.message, 'success');
        } catch (err) { Swal.fire('Lỗi', 'Không thể thay đổi trạng thái', 'error'); }
      }
    });
  };

  if (user?.role !== 'admin') return <h3 className="text-center mt-5">Bạn không có quyền truy cập!</h3>;

  return (
    <div className="container mt-4 mb-5">
      <h3 className="fw-bold text-primary mb-4"><i className="bi bi-chat-left-text"></i> Quản lý Hỗ trợ Khách hàng</h3>
      
      {/* 🔥 FIX LAYOUT: Tách riêng Card và Row để không bị sập */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden" style={{ height: '75vh', minHeight: '600px' }}>
        <div className="row g-0 h-100">
          
          {/* CỘT TRÁI: DANH SÁCH USER */}
          <div className="col-md-4 col-lg-3 border-end bg-white d-flex flex-column h-100">
            <div className="bg-light p-3 fw-bold border-bottom">Khách hàng cần hỗ trợ</div>
            <div className="overflow-auto flex-grow-1">
              {chatUsers.length === 0 ? <p className="text-muted p-3 text-center">Chưa có đoạn chat nào.</p> : null}
              {chatUsers.map((u, idx) => (
                <div key={idx} 
                     className={`p-3 border-bottom d-flex align-items-center ${activeUser?._id?._id === u._id?._id ? 'bg-primary bg-opacity-10' : ''}`}
                     style={{ cursor: 'pointer', transition: '0.2s' }}
                     onClick={() => { setActiveUser(u); setMessages([]); }}>
                  <img src={u._id?.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} className="rounded-circle me-3 border" style={{ width: '45px', height: '45px', objectFit: 'cover' }} />
                  <div className="flex-grow-1">
                    <h6 className="m-0 fw-bold text-dark d-flex justify-content-between align-items-center">
                      <span className="text-truncate" style={{ maxWidth: '120px' }}>{u._id?.name || 'Khách Ẩn danh'}</span>
                      {u._id?.isBlocked && <span className="badge bg-danger ms-1" style={{ fontSize: '0.65rem' }}>Đã chặn</span>}
                    </h6>
                    <small className="text-muted">{new Date(u.lastMessageAt).toLocaleString('vi-VN')}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: KHUNG CHAT VỚI KHÁCH */}
          <div className="col-md-8 col-lg-9 d-flex flex-column bg-light h-100">
            {activeUser ? (
              <>
                {/* Header */}
                <div className="bg-white p-3 border-bottom fw-bold text-primary d-flex align-items-center justify-content-between shadow-sm" style={{ zIndex: 10 }}>
                  <div className="d-flex align-items-center">
                    <img src={activeUser._id?.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} className="rounded-circle me-2 border" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                    Đang chat với: {activeUser._id?.name || 'Khách Ẩn danh'}
                    {activeUser._id?.isBlocked && <span className="badge bg-danger ms-2">Bị chặn</span>}
                  </div>
                  
                  {/* Nút thao tác Admin */}
                  <div>
                    <button className="btn btn-sm btn-outline-danger me-2" onClick={handleDeleteChat} title="Xóa toàn bộ tin nhắn">
                      <i className="bi bi-trash"></i> Xóa Chat
                    </button>
                    <button className={`btn btn-sm ${activeUser._id?.isBlocked ? 'btn-success' : 'btn-warning text-dark'}`} onClick={handleBlockUser}>
                      <i className={`bi ${activeUser._id?.isBlocked ? 'bi-unlock-fill' : 'bi-lock-fill'}`}></i> {activeUser._id?.isBlocked ? 'Mở chặn' : 'Khóa mõm'}
                    </button>
                  </div>
                </div>
                
                {/* Nội dung Chat */}
                <div className="flex-grow-1 p-4 overflow-auto">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`d-flex mb-3 ${msg.sender === 'admin' ? 'justify-content-end' : 'justify-content-start'}`}>
                      {/* 🔥 FIX ẢNH BỊ TRÀN: Thêm width fit-content và bọc ảnh cẩn thận */}
                      <div className={`p-2 px-3 rounded-4 shadow-sm ${msg.sender === 'admin' ? 'bg-primary text-white' : 'bg-white border'}`} style={{ maxWidth: '75%', width: 'fit-content', wordBreak: 'break-word' }}>
                        
                        {msg.text && <div className="mb-1">{msg.text}</div>}
                        
                        {msg.attachmentType === 'image' && (
                          <div className="mt-2 text-center bg-white p-1 rounded">
                            <img src={msg.attachmentUrl} className="img-fluid rounded border" alt="đính kèm" style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'contain' }} />
                          </div>
                        )}
                        
                        {msg.attachmentType === 'file' && (
                          <a href={msg.attachmentUrl} download="tep_dinh_kem" className={`btn btn-sm mt-2 fw-bold w-100 ${msg.sender === 'admin' ? 'btn-light text-primary' : 'btn-primary text-white'}`}>
                            <i className="bi bi-file-earmark-arrow-down me-1"></i> Tải tệp xuống
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  {uploading && <div className="text-end small text-muted fst-italic">Đang gửi file...</div>}
                  <div ref={messagesEndRef} />
                </div>

                {/* Nhập tin nhắn */}
                <div className="bg-white p-3 border-top shadow-sm">
                  <form onSubmit={sendMessage} className="d-flex align-items-center input-group-lg">
                    <button type="button" className="btn btn-light rounded-circle text-secondary me-2 shadow-sm" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                      <i className="bi bi-paperclip fs-5"></i>
                    </button>
                    <input type="file" className="d-none" ref={fileInputRef} onChange={handleFileUpload} />
                    
                    <input type="text" className="form-control rounded-pill border-secondary px-4 bg-light flex-grow-1 shadow-sm" placeholder="Nhập câu trả lời... (Win + . để chèn Emoji)" value={text} onChange={(e) => setText(e.target.value)} disabled={uploading} />
                    
                    <button type="submit" className="btn btn-primary rounded-circle ms-3 shadow-sm" style={{ width: '50px', height: '50px' }} disabled={uploading}>
                      <i className="bi bi-send-fill"></i>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100 text-muted flex-column">
                <i className="bi bi-chat-square-dots" style={{ fontSize: '5rem', opacity: 0.3 }}></i>
                <h5 className="mt-3">Chọn một khách hàng để bắt đầu chat</h5>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminChat;