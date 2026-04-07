const Banner = () => {
  return (
    <div className="container mt-4">
      <div 
        className="rounded-4 p-5 text-white position-relative overflow-hidden shadow-lg"
        style={{ 
          background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '350px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div className="position-relative z-1" style={{ maxWidth: '600px' }}>
          <span className="badge bg-warning text-dark fw-bold mb-3 px-3 py-2 rounded-pill">
            ✨ SỰ KIỆN ĐỌC SÁCH MÙA THU
          </span>
          <h1 className="display-4 fw-bold mb-3">Mở trang sách,<br />Mở thế giới.</h1>
          <p className="fs-5 mb-4 opacity-75">
            Hơn 10,000 tựa sách đang chờ bạn khám phá. Đăng nhập ngay để nhận ưu đãi thành viên.
          </p>
          <button className="btn btn-warning btn-lg fw-bold rounded-pill px-5 shadow">
            Mua sách ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banner;