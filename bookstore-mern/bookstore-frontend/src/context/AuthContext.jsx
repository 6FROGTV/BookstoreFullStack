import { createContext, useState, useContext, useEffect } from 'react';
import Swal from 'sweetalert2';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Thêm trạng thái chờ khi đang kiểm tra túi

  // Vừa vào web là lục trong túi (localStorage) xem có thẻ (token) không
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Hàm Đăng nhập: Lưu thông tin vào kho và nhét thẻ vào túi
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    
    // Thông báo đăng nhập thành công xịn xò
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Chào mừng ${userData.name} đã quay trở lại!`,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  };

  // Hàm Đăng xuất: Xóa sạch thông tin
  const logout = () => {
    // Thay alert cũ bằng SweetAlert2 popup xác nhận
    Swal.fire({
      title: 'Đăng xuất?',
      text: "Bạn có chắc chắn muốn thoát khỏi hệ thống?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0ea5e9',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Đăng xuất ngay',
      cancelButtonText: 'Ở lại',
      customClass: { popup: 'rounded-4' }
    }).then((result) => {
      if (result.isConfirmed) {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        Swal.fire({
          icon: 'success',
          title: 'Đã đăng xuất!',
          text: 'Hẹn gặp lại bạn sớm nhất.',
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'rounded-4' }
        });
      }
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};