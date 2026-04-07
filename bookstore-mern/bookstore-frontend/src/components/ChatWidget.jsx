import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import imageCompression from 'browser-image-compression';
import Swal from 'sweetalert2'; // 🔥 Bổ sung thư viện thông báo

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const fetchMessages = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://192.168.1.12:5000/api/chat', { headers: { Authorization: `Bearer ${token}` } });
      setMessages(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    let interval;
    if (isOpen && user) {
      fetchMessages();
      interval = setInterval(fetchMessages, 3000);
    }
    return () => clearInterval(interval);
  }, [isOpen, user]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Xử lý gửi tin nhắn text & emote
  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://192.168.1.12:5000/api/chat', { text }, { headers: { Authorization: `Bearer ${token}` } });
      setMessages([...messages, res.data]);
      setText('');
    } catch (err) { 
      // 🔥 BẮT LỖI 403 TỪ SERVER VÀ BÁO CHO KHÁCH BIẾT
      if (err.response && err.response.status === 403) {
        Swal.fire('Cấm ngôn!', 'Tài khoản của bạn đã bị Admin chặn tính năng Chat!', 'error');
        setText(''); // Xóa tin nhắn đang gõ
      } else {
        console.log(err); 
      }
    }
  };

  // Xử lý upload file/ảnh
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
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
        text: `Đã gửi 1 ${attachmentType === 'image' ? 'hình ảnh' : 'tệp đính kèm'}`, 
        attachmentUrl, attachmentType 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setMessages([...messages, res.data]);
    } catch (err) { 
      // 🔥 BẮT LỖI 403 KHI CỐ TÌNH UP ẢNH
      if (err.response && err.response.status === 403) {
        Swal.fire('Cấm ngôn!', 'Tài khoản của bạn đã bị Admin chặn tính năng Chat!', 'error');
      } else {
        console.log("Lỗi upload", err); 
      }
    }
    finally { setUploading(false); e.target.value = null; }
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  if (user?.role === 'admin') return null;

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {isOpen ? (
        <div className="card shadow-lg border-0 rounded-4" style={{ width: '350px', height: '480px', display: 'flex', flexDirection: 'column' }}>
          <div className="bg-primary text-white p-3 rounded-top-4 d-flex justify-content-between align-items-center">
            <h6 className="m-0 fw-bold"><i className="bi bi-headset me-2"></i> Hỗ trợ trực tuyến</h6>
            <button className="btn-close btn-close-white" onClick={() => setIsOpen(false)}></button>
          </div>

          <div className="card-body p-3 overflow-auto" style={{ backgroundColor: '#f8fafc', flex: 1 }}>
            {!user ? ( <p className="text-center text-muted mt-5">Đăng nhập để chat với Admin!</p> ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                  <div className={`p-2 px-3 rounded-4 shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white border'}`} style={{ maxWidth: '80%', fontSize: '14px', wordBreak: 'break-word' }}>
                    {msg.text}
                    {msg.attachmentType === 'image' && (
                      <img src={msg.attachmentUrl} className="img-fluid rounded mt-2 d-block border" alt="đính kèm" style={{maxHeight: '150px'}} />
                    )}
                    {msg.attachmentType === 'file' && (
                      <a href={msg.attachmentUrl} download="tep_dinh_kem" className={`btn btn-sm mt-2 fw-bold w-100 ${msg.sender === 'user' ? 'btn-light text-primary' : 'btn-primary text-white'}`}>
                        <i className="bi bi-file-earmark-arrow-down me-1"></i> Tải tệp xuống
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
            {uploading && <div className="text-center small text-muted fst-italic">Đang gửi file...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="card-footer bg-white p-2">
            <form onSubmit={sendMessage} className="d-flex align-items-center">
              <button type="button" className="btn btn-light rounded-circle text-secondary me-2 shadow-sm" onClick={() => fileInputRef.current.click()} disabled={!user || uploading}>
                <i className="bi bi-paperclip"></i>
              </button>
              <input type="file" className="d-none" ref={fileInputRef} onChange={handleFileUpload} />
              
              <input type="text" className="form-control rounded-pill border-secondary px-3 bg-light shadow-sm" placeholder="Nhập tin nhắn... (Win + . để gửi Emoji)" value={text} onChange={(e) => setText(e.target.value)} disabled={!user || uploading} />
              
              <button type="submit" className="btn btn-primary rounded-circle ms-2 shadow-sm" disabled={!user || uploading}><i className="bi bi-send-fill"></i></button>
            </form>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="btn btn-primary rounded-circle shadow-lg transition-hover" style={{ width: '60px', height: '60px', fontSize: '24px' }}>
          <i className="bi bi-chat-dots-fill"></i>
        </button>
      )}
    </div>
  );
};

export default ChatWidget;