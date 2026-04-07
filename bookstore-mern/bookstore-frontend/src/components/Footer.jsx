import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white pt-5 pb-4 mt-5 border-top animation-fade-in">
      <div className="container">
        <div className="row g-4">
          {/* CỘT 1: THÔNG TIN LIÊN HỆ */}
          <div className="col-md-4">
            <h5 className="fw-bold text-primary mb-4">
              <i className="bi bi-book-half me-2"></i>Web Bán Sách
            </h5>
            <p className="text-muted small d-flex align-items-start">
              <i className="bi bi-geo-alt-fill me-2 text-primary mt-1"></i> 
              36 đường Tân Chánh Hiệp 34, phường Trung Mỹ Tây, TP.HCM
            </p>
            <p className="text-muted small">
              <i className="bi bi-telephone-fill me-2 text-primary"></i> 
              1900 1836 (7:00 - 22:00)
            </p>
            <p className="text-muted small">
              <i className="bi bi-envelope-fill me-2 text-primary"></i> 
              anhhuybui672@gmail.com
            </p>
          </div>

          {/* CỘT 2: ĐIỀU KHOẢN & CHÍNH SÁCH */}
          <div className="col-md-4 ps-md-5">
            <h5 className="fw-bold mb-4 text-dark">Điều khoản và chính sách</h5>
            <ul className="list-unstyled text-muted small policy-links">
              {[
                { path: 'shipping', name: 'Chính sách giao hàng', icon: 'bi-truck' },
                { path: 'privacy', name: 'Chính sách bảo mật', icon: 'bi-shield-lock' },
                { path: 'warranty', name: 'Bảo hành & đổi trả', icon: 'bi-arrow-left-right' },
                { path: 'payment', name: 'Chính sách thanh toán', icon: 'bi-credit-card' },
                { path: 'terms', name: 'Điều kiện & thành viên', icon: 'bi-person-check' },
                { path: 'installment', name: 'Chính sách trả góp 0%', icon: 'bi-percent' },
              ].map(policy => (
                <li key={policy.path} className="mb-3 transition-hover">
                  <Link to={`/policy/${policy.path}`} className="text-decoration-none text-muted d-flex align-items-center">
                    <i className={`bi ${policy.icon} me-3 text-secondary`}></i> {policy.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT 3: HỆ THỐNG CỬA HÀNG & MẠNG XÃ HỘI */}
          <div className="col-md-4 text-center text-md-start">
            <h5 className="fw-bold mb-4 text-dark">Hệ thống cửa hàng</h5>
            
            {/* 🔥 PHẦN HÌNH ẢNH ĐÃ CẬP NHẬT: Dùng ảnh từ public/images/ */}
            <img 
              src="/images/bookstore.png" 
              className="img-fluid rounded-4 shadow-sm mb-3 border" 
              alt="Hệ thống Web Bán Sách" 
              style={{maxHeight: '150px', objectFit: 'cover', width: '100%'}} 
            />
            {/* -------------------------------------------------------------------------- */}

            <div className="d-flex justify-content-center justify-content-md-start gap-3 mt-2 social-icons">
              {[
                { icon: 'bi-facebook', color: 'text-primary', href: 'https://www.facebook.com/EchTV2k4' },
                { icon: 'bi-youtube', color: 'text-danger', href: 'https://www.youtube.com/@huyanh4228' },
                { icon: 'bi-tiktok', color: 'text-info', href: 'https://www.tiktok.com/@echtv204' },
                { icon: 'bi-instagram', color: 'text-warning', href: 'https://www.instagram.com/echtv204/' },
              ].map((social, index) => (
                <a key={index} href={social.href} className={`${social.color} fs-4 transition-hover`}>
                  <i className={`bi ${social.icon}`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>

        <hr className="my-4 border-secondary opacity-25" />
        
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2">
          <p className="text-muted small mb-0">© <strong>2026 Web Bán Sách - Nhóm 14</strong>. All rights reserved.</p>
          <div className="payment-icons d-flex align-items-center gap-3 bg-light p-2 rounded-pill px-3 border shadow-sm">
             <span className="small text-muted me-1">Hỗ trợ:</span>
             <img src="https://tse4.mm.bing.net/th/id/OIP.-DhgkiQDEdoru7CJdZrwEAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" alt="Momo" height="22" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" height="18" />
             <img src="https://tse1.mm.bing.net/th/id/OIP.mNBtUjnwgmURuGtPeyptwgHaEp?rs=1&pid=ImgDetMain&o=7&rm=3" alt="Visa" height="13" />
             <img src="https://tse2.mm.bing.net/th/id/OIP.pn3RUm1xk1HiAxWIgC6CIwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" alt="VNPay" height="18" />
          </div>
        </div>
      </div>

      {/* Thêm chút CSS cho đẹp nhen */}
      <style>{`
        .transition-hover:hover { transform: translateY(-3px); }
        .transition-all { transition: all 0.3s ease; }
        .social-icons a, .policy-links li { transition: all 0.2s ease-in-out; }
        .social-icons a:hover { opacity: 0.8; scale: 1.1; }
        .policy-links a:hover { text-decoration: underline !important; color: #0d6efd !important; }
      `}</style>
    </footer>
  );
};

export default Footer;