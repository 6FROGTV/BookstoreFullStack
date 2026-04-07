import { Link, useLocation } from 'react-router-dom';

const OrderSuccess = () => {
  const location = useLocation();
  const { orderId } = location.state || { orderId: 'N/A' };

  return (
    <div className="container mt-5 mb-5">
      <div className="card border-0 shadow-lg text-center p-5 rounded-4 mx-auto" style={{ maxWidth: '600px' }}>
        <i className="bi bi-check-circle-fill text-success mb-3" style={{ fontSize: '5rem' }}></i>
        <h2 className="fw-bold text-success mb-2">Đặt hàng thành công!</h2>
        <p className="text-muted fs-5">Mã đơn hàng: <strong className="text-dark">ORD-{orderId.slice(-6).toUpperCase()}</strong></p>
        <p className="bg-light p-3 rounded-3 mt-3 text-muted">
          Cảm ơn bạn đã tin tưởng mua sắm. Đơn hàng của bạn đã được hệ thống ghi nhận và sẽ được xử lý trong thời gian sớm nhất!
        </p>
        <Link to="/" className="btn btn-primary rounded-pill px-5 py-2 mt-3 fw-bold shadow border-0">
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;