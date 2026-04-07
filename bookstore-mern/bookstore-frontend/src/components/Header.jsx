import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; 

const Header = () => {
  const { cartCount } = useCart();
  const { user, logout } = useAuth(); 

  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm" style={{ backgroundColor: '#0ea5e9' }}>
      <div className="container py-2">
        <Link className="navbar-brand fw-bold fs-3" to="/">
          <i className="bi bi-book-half me-2"></i>Web Bán Sách
        </Link>
        
        <div className="d-flex align-items-center ms-auto gap-3">
          {/* GIỎ HÀNG */}
          <Link className="btn btn-light position-relative fw-bold text-primary px-4 rounded-pill shadow-sm" to="/cart">
            <i className="bi bi-cart3 fs-5 me-1"></i> Giỏ hàng
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {cartCount}
            </span>
          </Link>

          {/* KHU VỰC TÀI KHOẢN */}
          {user ? (
            <div className="dropdown">
              <button className="btn btn-outline-light rounded-pill dropdown-toggle fw-bold d-flex align-items-center px-3" type="button" data-bs-toggle="dropdown">
                {/* 🔥 HIỂN THỊ AVATAR NẾU CÓ, KHÔNG THÌ HIỂN THỊ ICON MẶC ĐỊNH */}
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="rounded-circle me-2 object-fit-cover border" style={{ width: '26px', height: '26px' }} />
                ) : (
                  <i className="bi bi-person-circle me-2 fs-5"></i>
                )}
                Xin chào, {user.name}
              </button>
              
              <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                <li><Link className="dropdown-item py-2" to="/profile"><i className="bi bi-person-vcard me-2 text-primary"></i>Hồ sơ cá nhân</Link></li>
                {user.role === 'admin' && (
                  <li><Link className="dropdown-item py-2 text-danger fw-bold" to="/admin"><i className="bi bi-shield-lock me-2"></i>Trang Quản Trị</Link></li>
                )}
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item py-2 text-danger" onClick={logout}><i className="bi bi-box-arrow-right me-2"></i> Đăng xuất</button></li>
              </ul>
            </div>
          ) : (
            <Link to="/login" className="btn btn-warning rounded-pill fw-bold px-4 shadow-sm">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;