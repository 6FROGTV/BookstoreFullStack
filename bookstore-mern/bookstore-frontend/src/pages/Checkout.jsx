import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user, login } = useAuth(); // 🔥 Lấy thêm hàm login để cập nhật điểm sau khi mua
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    paymentMethod: 'COD',
    note: ''
  });
  const [orderId, setOrderId] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATE CHO VOUCHER ---
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  // Danh sách 5 Voucher tĩnh (Frontend)
  const vouchers = {
    'GIAM10K': { type: 'fixed', value: 10000, desc: 'Giảm 10.000đ' },
    'GIAM20K': { type: 'fixed', value: 20000, desc: 'Giảm 20.000đ' },
    'FREESHIP': { type: 'fixed', value: 30000, desc: 'Miễn phí vận chuyển (30k)' },
    'SALE10': { type: 'percent', value: 10, desc: 'Giảm 10%' },
    'HUYPRO': { type: 'percent', value: 20, desc: 'Giảm 20% (Mã VIP)' }
  };

  // --- STATE CHO ĐIỂM THƯỞNG ---
  const [pointsInput, setPointsInput] = useState('');
  const [pointsUsed, setPointsUsed] = useState(0);
  const [showPointBox, setShowPointBox] = useState(false);

  // ==========================================
  // 🔥 LOGIC TÍNH TOÁN TIỀN (VOUCHER + ĐIỂM)
  // ==========================================
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // 1. Tính tiền giảm từ Voucher
  let voucherDiscount = 0;
  if (appliedVoucher && vouchers[appliedVoucher]) {
    const v = vouchers[appliedVoucher];
    if (v.type === 'fixed') {
      voucherDiscount = v.value;
    } else if (v.type === 'percent') {
      voucherDiscount = (totalPrice * v.value) / 100;
    }
    if (voucherDiscount > totalPrice) voucherDiscount = totalPrice;
  }

  // 2. Tính tiền sau khi áp Voucher
  let tempPrice = totalPrice - voucherDiscount;

  // 3. Tính tiền giảm từ Điểm thưởng
  let pointsDiscount = pointsUsed * 1000;
  if (pointsDiscount > tempPrice) {
    pointsDiscount = tempPrice; // Tiền giảm bằng điểm không vượt quá số tiền còn lại
  }

  // 4. Giá cuối cùng
  const finalPrice = tempPrice - pointsDiscount;

  // --- XỬ LÝ NÚT ÁP DỤNG VOUCHER ---
  const handleApplyVoucher = () => {
    const code = voucherInput.trim().toUpperCase();
    if (!code) return;

    if (vouchers[code]) {
      setAppliedVoucher(code);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Đã áp dụng: ${vouchers[code].desc}`, showConfirmButton: false, timer: 2000 });
    } else {
      setAppliedVoucher(null);
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Mã giảm giá không hợp lệ!', showConfirmButton: false, timer: 2000 });
    }
  };

  // --- XỬ LÝ NÚT ÁP DỤNG ĐIỂM ---
  const handleApplyPoints = () => {
    const pts = parseInt(pointsInput) || 0;
    const available = user?.rewardPoints || 0;

    if (pts <= 0 || pts > available) {
      return Swal.fire('Lỗi', 'Số điểm không hợp lệ hoặc vượt quá điểm hiện có!', 'warning');
    }

    const potentialDiscount = pts * 1000;
    if (potentialDiscount > tempPrice) {
      return Swal.fire('Lỗi', 'Tiền giảm không được vượt quá giá trị đơn hàng!', 'warning');
    }

    setPointsUsed(pts);
    setShowPointBox(false);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Đã áp dụng ${pts} điểm`, showConfirmButton: false, timer: 2000 });
  };

  const getQRUrl = () => {
    const bankPrefix = formData.paymentMethod === 'MOMO' ? 'momo' : 'mbbank';
    return `https://img.vietqr.io/image/${bankPrefix}-0898539476-compact2.png?amount=${finalPrice}&addInfo=Thanh toan ORD-${orderId?.slice(-6).toUpperCase()}&accountName=BUI ANH HUY`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return Swal.fire('Lỗi', 'Giỏ hàng đang trống!', 'error');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://192.168.1.12:5000/api/orders', {
        customerName: formData.fullName, 
        phone: formData.phone,
        address: formData.address,
        paymentMethod: formData.paymentMethod,
        note: formData.note,
        totalAmount: finalPrice, 
        pointsUsed: pointsUsed, // 🔥 Gửi số điểm lên Server
        items: cart.map(item => ({
          _id: item._id,
          title: item.title,
          quantity: item.quantity,
          price: item.price
        }))
      }, { headers: { Authorization: `Bearer ${token}` } });

      // Cập nhật lại thông tin user trong hệ thống (để load lại điểm mới)
      if (res.data.user && res.data.token) {
        login(res.data.user, res.data.token);
      }

      const savedOrderId = res.data.orderId;
      setOrderId(savedOrderId); 
      
      if (formData.paymentMethod === 'COD') {
        clearCart();
        let msg = 'Đơn hàng của bạn đang được xử lý.';
        if (res.data.earnedPoints > 0) msg += ` Bạn được tặng thêm ${res.data.earnedPoints} điểm.`;

        Swal.fire({
          icon: 'success',
          title: 'Đặt hàng thành công!',
          text: msg,
          showConfirmButton: true,
        }).then(() => navigate('/order-success', { state: { orderId: savedOrderId } }));
      } else {
        setShowQR(true);
      }
    } catch (err) { 
      Swal.fire('Lỗi', 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showQR) return (
    <div className="container mt-5 mb-5 d-flex justify-content-center">
      <div className="card border-0 shadow-lg p-4 rounded-4" style={{ maxWidth: '700px', width: '100%' }}>
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
          <div>
            <h3 className="fw-bold m-0 text-primary">Thanh toán đơn ORD-{orderId?.slice(-6).toUpperCase()}</h3>
            <small className="text-muted">Phương thức: {formData.paymentMethod}</small>
          </div>
          <div className="fw-bold text-danger fs-4">{finalPrice.toLocaleString()} ₫</div>
        </div>
        <div className="row g-4">
          <div className="col-md-6 border-end text-center">
            <h5 className="fw-bold mb-3">Quét QR để thanh toán</h5>
            <div className="rounded-4 d-flex justify-content-center align-items-center p-2 mx-auto border border-dashed" style={{ width: '240px', height: '240px' }}>
              <img src={getQRUrl()} className="img-fluid" alt="VietQR" />
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-light p-3 rounded-3 small text-muted mb-4">
              Thông tin chuyển khoản:<br/>
              - STK: <strong>0898539476</strong><br/>
              - Chủ TK: <strong>BUI ANH HUY</strong>
            </div>
            <button 
              className="btn btn-success w-100 fw-bold py-2 shadow-sm" 
              onClick={() => { clearCart(); navigate('/order-success', { state: { orderId: orderId } }); }}
            >
              TÔI ĐÃ THANH TOÁN
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="container mt-5 mb-5">
      <h2 className="fw-bold text-primary mb-4">Thanh toán</h2>
      <form onSubmit={handleSubmit} className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h5 className="fw-bold mb-4">Thông tin giao hàng</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Họ tên *</label>
                <input type="text" className="form-control" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Số điện thoại *</label>
                <input type="text" className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
              </div>
              <div className="col-12">
                <label className="form-label fw-bold">Địa chỉ nhận hàng *</label>
                <input type="text" className="form-control" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Phương thức thanh toán *</label>
                <select className="form-select border-primary fw-bold" value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                  <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                  <option value="MOMO">Thanh toán qua ví MoMo</option>
                  <option value="MBBANK">Thanh toán qua MB Bank</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Ghi chú đơn hàng</label>
                <input type="text" className="form-control" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="btn btn-danger px-5 rounded-pill fw-bold shadow w-100 mt-5" disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
            </button>
          </div>
        </div>
        
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: '#f8fafc' }}>
            <h5 className="fw-bold mb-4">Đơn hàng của bạn</h5>
            {cart.map(item => (
              <div key={item._id} className="d-flex align-items-center mb-3">
                <img src={item.imageUrl} className="rounded" style={{ width: '50px', height: '70px', objectFit: 'cover', marginRight: '15px' }} />
                <div className="flex-grow-1">
                  <h6 className="mb-1 fw-bold text-primary">{item.title}</h6>
                  <small>SL: {item.quantity}</small>
                </div>
                <div className="fw-bold text-dark">{(item.price * item.quantity).toLocaleString()} ₫</div>
              </div>
            ))}
            
            <hr className="text-secondary" />

            {/* KHU VỰC NHẬP MÃ GIẢM GIÁ */}
            <div className="mb-3">
              <label className="form-label fw-bold small text-muted">Mã giảm giá / Voucher</label>
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control text-uppercase" 
                  placeholder="Ví dụ: FREESHIP, HUYPRO" 
                  value={voucherInput} 
                  onChange={e => setVoucherInput(e.target.value)} 
                />
                <button className="btn btn-primary fw-bold px-4" type="button" onClick={handleApplyVoucher}>
                  ÁP DỤNG
                </button>
              </div>
            </div>

            {/* 🔥 KHU VỰC ĐIỂM THƯỞNG */}
            <div className="bg-white p-3 rounded-3 border border-warning mt-3 mb-3 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold">
                  <i className="bi bi-star-fill text-warning me-1"></i> Điểm tích lũy: <span className="text-warning fs-5">{user?.rewardPoints || 0}</span>
                </span>
                
                {!showPointBox && pointsUsed === 0 && (
                  <button type="button" className="btn btn-sm btn-warning text-dark fw-bold" onClick={() => setShowPointBox(true)}>Sử dụng</button>
                )}
                {pointsUsed > 0 && (
                  <button type="button" className="btn btn-sm btn-success text-white fw-bold" disabled>Đã dùng {pointsUsed} điểm</button>
                )}
              </div>

              {showPointBox && (
                <div className="input-group input-group-sm mb-2">
                  <input type="number" className="form-control" placeholder="Nhập số điểm..." value={pointsInput} onChange={(e) => setPointsInput(e.target.value)} min="1" />
                  <button className="btn btn-dark" type="button" onClick={handleApplyPoints}>Áp dụng</button>
                </div>
              )}
              <small className="text-muted d-block fst-italic small">- 1 điểm = 1.000 ₫ giảm giá</small>
            </div>

            {/* THỐNG KÊ CHI TIẾT TIỀN */}
            <div className="d-flex justify-content-between align-items-center mb-2 text-muted small">
              <span>Tạm tính</span>
              <span>{totalPrice.toLocaleString()} ₫</span>
            </div>
            
            {appliedVoucher && (
              <div className="d-flex justify-content-between align-items-center mb-2 text-success small fw-bold">
                <span>Voucher ({vouchers[appliedVoucher].desc})</span>
                <span>- {voucherDiscount.toLocaleString()} ₫</span>
              </div>
            )}

            {pointsUsed > 0 && (
              <div className="d-flex justify-content-between align-items-center mb-2" style={{ color: '#d97706' }}>
                <span className="small fw-bold">Trừ điểm ({pointsUsed} điểm)</span>
                <span className="small fw-bold">- {pointsDiscount.toLocaleString()} ₫</span>
              </div>
            )}

            <hr className="text-secondary" />

            <div className="d-flex justify-content-between align-items-center">
              <b className="fs-5">TỔNG CỘNG</b>
              <b className="fs-3 text-danger">{finalPrice.toLocaleString()} ₫</b>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};

export default Checkout;