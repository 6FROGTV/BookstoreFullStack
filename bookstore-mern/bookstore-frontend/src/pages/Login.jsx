import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google'; 
import Swal from 'sweetalert2'; // 🔥 Thêm thư viện thông báo

const Login = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  
  const { login } = useAuth(); 
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLoginMode) {
        const response = await axios.post('http://192.168.1.12:5000/api/auth/login', { 
          email: formData.email, 
          password: formData.password 
        });
        login(response.data.user, response.data.token);
        // Không cần alert vì AuthContext đã có Toast chào mừng
        navigate('/'); 
      } else {
        await axios.post('http://192.168.1.12:5000/api/auth/register', formData);
        
        // NÂNG CẤP: Thông báo đăng ký thành công đẹp mắt
        Swal.fire({
          icon: 'success',
          title: 'Đăng ký thành công!',
          text: 'Bây giờ bạn có thể đăng nhập vào hệ thống.',
          confirmButtonColor: '#0ea5e9',
          customClass: { popup: 'rounded-4' }
        });
        
        setIsLoginMode(true); 
      }
    } catch (err) { 
      const msg = err.response?.data?.message || 'Có lỗi xảy ra!';
      setError(msg);
      // NÂNG CẤP: Thông báo lỗi bằng Popup
      Swal.fire({
        icon: 'error',
        title: 'Thất bại',
        text: msg,
        customClass: { popup: 'rounded-4' }
      });
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post('http://192.168.1.12:5000/api/auth/google', {
        credential: credentialResponse.credential
      });
      login(response.data.user, response.data.token);
      navigate('/'); 
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi Google',
        text: 'Đăng nhập Google thất bại!',
        customClass: { popup: 'rounded-4' }
      });
    }
  };

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow-sm border-0 rounded-4 p-4">
          <h2 className="fw-bold text-center text-primary mb-4">
            {isLoginMode ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}
          </h2>
          
          {error && (
            <div className="alert alert-danger rounded-3 py-2 small fw-bold">
              <i className="bi bi-exclamation-triangle me-2"></i>{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLoginMode && (
              <div className="mb-3">
                <label className="form-label fw-bold">Họ và tên</label>
                <input type="text" name="name" className="form-control rounded-3" required={!isLoginMode} onChange={handleChange} />
              </div>
            )}
            <div className="mb-3">
              <label className="form-label fw-bold">Email</label>
              <input type="email" name="email" className="form-control rounded-3" required onChange={handleChange} />
            </div>
            <div className="mb-4">
              <label className="form-label fw-bold">Mật khẩu</label>
              <input type="password" name="password" className="form-control rounded-3" required minLength="6" onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-primary w-100 fw-bold rounded-pill py-2 shadow-sm mb-3">
              {isLoginMode ? 'ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN'}
            </button>
          </form>

          <div className="d-flex align-items-center mb-3">
            <hr className="flex-grow-1" />
            <span className="px-2 text-muted small fw-bold">HOẶC</span>
            <hr className="flex-grow-1" />
          </div>
          
          <div className="d-flex justify-content-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => Swal.fire('Lỗi', 'Không thể kết nối với Google!', 'error')}
              useOneTap 
              shape="pill"
            />
          </div>

          <div className="text-center mt-4">
            <span className="text-muted small fw-bold">
              {isLoginMode ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            </span>
            <button 
              className="btn btn-link text-decoration-none fw-bold ms-1 small" 
              onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
            >
              {isLoginMode ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;