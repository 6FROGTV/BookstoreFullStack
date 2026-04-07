import { useParams, Link } from 'react-router-dom';

const Policy = () => {
  const { type } = useParams();

  const menuItems = [
    { id: 'shipping', name: 'Chính sách giao hàng', icon: 'bi-truck' },
    { id: 'privacy', name: 'Chính sách bảo mật', icon: 'bi-shield-lock' },
    { id: 'warranty', name: 'Bảo hành & đổi trả', icon: 'bi-arrow-left-right' },
    { id: 'payment', name: 'Chính sách thanh toán', icon: 'bi-credit-card' },
    { id: 'terms', name: 'Điều kiện & thành viên', icon: 'bi-person-check' },
    { id: 'installment', name: 'Chính sách trả góp', icon: 'bi-percent' },
  ];

  const renderContent = () => {
    switch (type) {
      case 'shipping':
        return (
          <>
            <h3 className="fw-bold mb-4 text-primary">Chính sách giao hàng</h3>
            <h5 className="fw-bold">1. Phạm vi giao hàng</h5>
            <p>• Giao hàng trên toàn bộ 63 tỉnh thành Việt Nam thông qua các đối tác vận chuyển uy tín như GHTK, GHN, Viettel Post.</p>
            <h5 className="fw-bold mt-4">2. Thời gian dự kiến</h5>
            <ul>
              <li><strong>Nội thành TP.HCM:</strong> 1 - 2 ngày làm việc.</li>
              <li><strong>Tỉnh thành xa:</strong> 3 - 7 ngày làm việc tùy khu vực.</li>
            </ul>
            <h5 className="fw-bold mt-4">3. Phí giao hàng</h5>
            <p>• Phí vận chuyển được tính dựa trên trọng lượng và địa chỉ nhận hàng, hiển thị rõ tại bước thanh toán.</p>
            <p>• Miễn phí vận chuyển cho đơn hàng từ 500.000đ trở lên.</p>
          </>
        );
      case 'privacy':
        return (
          <>
            <h3 className="fw-bold mb-4 text-primary">Chính sách bảo mật thông tin</h3>
            <p>Chúng tôi cam kết bảo vệ tuyệt đối thông tin cá nhân của khách hàng khi tham gia mua sắm tại Web Bán Sách.</p>
            <h5 className="fw-bold">1. Mục đích thu thập</h5>
            <ul>
              <li>Hỗ trợ khách hàng xử lý đơn hàng nhanh chóng.</li>
              <li>Gửi thông báo ưu đãi, chương trình khuyến mãi thành viên.</li>
              <li>Nâng cao chất lượng dịch vụ và trải nghiệm người dùng.</li>
            </ul>
            <h5 className="fw-bold mt-4">2. Phạm vi thu thập</h5>
            <p>• Bao gồm: Họ tên, số điện thoại, email, địa chỉ giao hàng và lịch sử mua sắm.</p>
          </>
        );
      case 'warranty':
        return (
          <>
            <h3 className="fw-bold mb-4 text-primary">Bảo hành & đổi trả hàng hóa</h3>
            <h5 className="fw-bold">1. Điều kiện đổi trả</h5>
            <p>• Sản phẩm còn nguyên tem, màng co, hộp, chưa qua sử dụng và không bị hư hỏng do tác động vật lý của người dùng.</p>
            <p>• Đổi trả trong vòng <strong>7 ngày</strong> kể từ ngày khách nhận hàng.</p>
            <h5 className="fw-bold mt-4">2. Các trường hợp được hỗ trợ</h5>
            <ul>
              <li>Sách bị lỗi in ấn (thiếu trang, nhòe mực, đóng ngược).</li>
              <li>Sách bị móp méo, hư hỏng nặng trong quá trình vận chuyển.</li>
              <li>Giao nhầm tựa sách hoặc thiếu số lượng đơn hàng.</li>
            </ul>
          </>
        );
      case 'payment':
        return (
          <>
            <h3 className="fw-bold mb-4 text-primary">Chính sách thanh toán</h3>
            <h5 className="fw-bold">1. Thanh toán khi nhận hàng (COD)</h5>
            <p>• Quý khách kiểm tra sách tại chỗ và thanh toán tiền mặt cho nhân viên giao hàng.</p>
            <h5 className="fw-bold mt-4">2. Chuyển khoản ngân hàng</h5>
            <div className="bg-light p-4 rounded-4 border">
              <p className="mb-2"><strong>Thông tin thụ hưởng:</strong></p>
              <p className="mb-1">Ngân hàng: <strong>MB Bank (Ngân hàng Quân đội)</strong></p>
              <p className="mb-1">Chủ tài khoản: <strong>BUI ANH HUY</strong></p>
              <p className="mb-0">Số tài khoản: <strong className="text-primary fs-5">0898539476</strong></p>
            </div>
            <p className="mt-3 small text-muted"><em>* Lưu ý: Ghi rõ Mã đơn hàng (ORD-...) trong nội dung chuyển khoản để chúng tôi duyệt đơn nhanh nhất.</em></p>
          </>
        );
      case 'terms':
        return (
          <>
            <h3 className="fw-bold mb-4 text-primary">Điều kiện & Điều khoản thành viên</h3>
            <h5 className="fw-bold">1. Quy định chung</h5>
            <p>• Mỗi khách hàng chỉ nên đăng ký 1 tài khoản duy nhất để hưởng các đặc quyền thành viên.</p>
            <p>• Không sử dụng hệ thống để phát tán thông tin vi phạm pháp luật hoặc cạnh tranh không lành mạnh.</p>
            <h5 className="fw-bold mt-4">2. Đặc quyền thành viên</h5>
            <ul>
              <li>Giảm thêm 5% cho mọi đơn hàng sau khi đạt hạng Đồng.</li>
              <li>Nhận mã giảm giá độc quyền vào ngày sinh nhật qua email.</li>
            </ul>
          </>
        );
      case 'installment':
        return (
          <>
            <h3 className="fw-bold mb-4 text-primary">Chính sách trả góp</h3>
            <h5 className="fw-bold">1. Điều kiện áp dụng</h5>
            <p>• Đơn hàng đạt giá trị tối thiểu từ <strong>2.000.000đ</strong> trở lên.</p>
            <p>• Khách hàng sở hữu thẻ tín dụng của các ngân hàng liên kết.</p>
            <h5 className="fw-bold mt-4">2. Hình thức trả góp</h5>
            <ul>
              <li>Trả góp 0% lãi suất thông qua ứng dụng mPOS hoặc cổng thanh toán tích hợp.</li>
              <li>Kỳ hạn linh hoạt: 3 tháng, 6 tháng, 9 tháng.</li>
            </ul>
          </>
        );
      default:
        return <h3 className="text-center mt-5">Đang cập nhật thêm nội dung mới...</h3>;
    }
  };

  return (
    <div className="container mt-4 mb-5">
      {/* Thanh dẫn đường (Breadcrumb) cho xịn */}
      <nav aria-label="breadcrumb" className="small mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Trang chủ</Link></li>
          <li className="breadcrumb-item active text-muted">Điều khoản & chính sách</li>
        </ol>
      </nav>

      <div className="row g-4">
        {/* Sidebar Menu - Huy dùng y hệt mẫu Sidebar của ToyShop nhé */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="bg-primary text-white p-3 fw-bold">ĐIỀU KHOẢN & CHÍNH SÁCH</div>
            <div className="list-group list-group-flush">
              {menuItems.map(item => (
                <Link 
                  key={item.id} 
                  to={`/policy/${item.id}`} 
                  className={`list-group-item list-group-item-action border-0 py-3 d-flex align-items-center ${type === item.id ? 'active fw-bold' : 'text-muted'}`}
                >
                  <i className={`bi ${item.icon} me-3 fs-5`}></i> {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Nội dung chi tiết - Phần này Huy dán code renderContent vào */}
        <div className="col-md-9">
          <div className="card border-0 shadow-sm rounded-4 p-5" style={{ minHeight: '650px', backgroundColor: '#fff' }}>
            <div className="policy-content" style={{ lineHeight: '1.8' }}>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Policy;