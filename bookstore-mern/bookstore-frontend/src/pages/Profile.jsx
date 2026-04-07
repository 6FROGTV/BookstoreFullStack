import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom'; // 🔥 BỔ SUNG IMPORT ĐỂ CHUYỂN TRANG
import axios from 'axios';
import Swal from 'sweetalert2'; 
import imageCompression from 'browser-image-compression'; 

const Profile = () => {
  const { user, login } = useAuth(); 
  
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(user?.avatar || ''); 
  const [isUploading, setIsUploading] = useState(false);

  const [message, setMessage] = useState({ type: '', text: '' });

  if (!user) return <h3 className="text-center mt-5 text-danger">Vui lòng đăng nhập để xem trang này!</h3>;

  // Hàm xử lý và NÉN ẢNH tự động
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Giới hạn an toàn trước khi nén để tránh treo trình duyệt
      if (file.size > 50 * 1024 * 1024) { 
        return Swal.fire('Lỗi', 'Vui lòng chọn ảnh có kích thước nhỏ hơn 50MB', 'warning');
      }

      // Cấu hình máy ép cân: Ép xuống tối đa 1MB, độ phân giải tối đa 1024px
      const options = {
        maxSizeMB: 1, 
        maxWidthOrHeight: 1024,
        useWebWorker: true
      };

      try {
        Swal.fire({ title: 'Đang nén ảnh...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        const compressedFile = await imageCompression(file, options);
        
        Swal.close(); 

        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatar(reader.result); 
        };
        reader.readAsDataURL(compressedFile);

      } catch (error) {
        console.log(error);
        Swal.fire('Lỗi', 'Không thể nén hình ảnh này!', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setIsUploading(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put('http://192.168.1.12:5000/api/auth/profile', 
        { name, password, avatar }, 
        { headers: { Authorization: `Bearer ${token}` } } 
      );

      login(response.data.user, response.data.token);
      
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã cập nhật hồ sơ', showConfirmButton: false, timer: 1500 });
      setPassword(''); 

    } catch (error) {
      if (!error.response) {
        setMessage({ type: 'danger', text: 'Không thể kết nối tới Server. Dữ liệu ảnh có thể quá lớn làm Server ngắt kết nối!' });
      } else if (error.response.status === 413) {
        setMessage({ type: 'danger', text: 'Dữ liệu ảnh quá lớn! Vượt quá giới hạn cho phép của Server.' });
      } else {
        setMessage({ type: 'danger', text: error.response?.data?.message || 'Lỗi cập nhật! Đã có lỗi xảy ra.' });
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="row justify-content-center mt-4">
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="bg-primary p-5" style={{ background: 'linear-gradient(45deg, #0ea5e9, #3b82f6)' }}></div>
          
          <div className="card-body p-4 position-relative">
            
            <div className="text-center position-absolute top-0 start-50 translate-middle">
              <div className="bg-white p-1 rounded-circle shadow position-relative">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="rounded-circle object-fit-cover border" style={{ width: '110px', height: '110px' }} />
                ) : (
                  <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-1 border" style={{ width: '110px', height: '110px' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <label htmlFor="avatar-upload" className="position-absolute bottom-0 end-0 bg-dark text-white rounded-circle p-2 shadow-sm" style={{ cursor: 'pointer', transform: 'translate(-5px, -5px)', border: '2px solid white' }}>
                  <i className="bi bi-camera-fill"></i>
                </label>
                <input id="avatar-upload" type="file" accept="image/*" className="d-none" onChange={handleImageChange} />
              </div>
            </div>

            <h3 className="text-center fw-bold mt-5 pt-4 mb-1">{user.name}</h3>
            <p className="text-center text-muted mb-3">
              <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-success'}`}>
                {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng thành viên'}
              </span>
            </p>

            {/* 🔥 KHU VỰC NÚT ĐÁNH GIÁ (CHỈ HIỂN THỊ KHI KHÔNG PHẢI ADMIN) */}
            {user.role !== 'admin' && (
              <div className="text-center mb-4">
                <Link to="/reviews" className="btn btn-warning fw-bold shadow-sm rounded-pill px-4 text-dark transition-hover">
                  <i className="bi bi-star-fill me-2"></i> Đánh giá Website
                </Link>
              </div>
            )}

            {message.text && (
              <div className={`alert alert-${message.type} rounded-3 py-2`}>{message.text}</div>
            )}

            <form onSubmit={handleSubmit} className="mt-2">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold text-muted">Email (Không thể đổi)</label>
                  <input type="email" className="form-control rounded-3 bg-light" value={user.email} disabled />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Tên hiển thị</label>
                  <input type="text" className="form-control rounded-3" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold mt-2">Đổi mật khẩu mới (Bỏ trống nếu không muốn đổi)</label>
                  <input type="password" className="form-control rounded-3" placeholder="Nhập mật khẩu mới..." value={password} onChange={(e) => setPassword(e.target.value)} minLength="6" />
                </div>
              </div>
              
              <div className="text-end mt-5 mb-2">
                <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm" disabled={isUploading}>
                  {isUploading ? 'Đang lưu...' : <><i className="bi bi-floppy me-2"></i> Lưu Thay Đổi</>}
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;