import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Swal from "sweetalert2";

const Cart = () => {
  const { cart, setCart } = useCart();

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const removeItem = (id) => {
    // NÂNG CẤP: Popup xác nhận xóa xịn xò
    Swal.fire({
      title: "Xóa sách khỏi giỏ?",
      text: "Bạn có chắc chắn muốn bỏ cuốn sách này không?",
      icon: "warning",
      showCancelButton: true,

      confirmButtonText: "Đúng, xóa nó!",
      cancelButtonText: "Hủy",
      customClass: { popup: "rounded-4" },
    }).then((result) => {
      if (result.isConfirmed) {
        setCart(cart.filter((item) => item._id !== id));
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Đã xóa sản phẩm!",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };

  const updateQuantity = (id, newQuantity, stock) => {
    const qty = parseInt(newQuantity);
    if (qty < 1 || isNaN(qty)) return;

    const maxQty = stock || 100;
    if (qty > maxQty) {
      Swal.fire({
        icon: "error",
        title: "Vượt quá tồn kho",
        text: `Xin lỗi, chúng tôi chỉ còn tối đa ${maxQty} sản phẩm!`,
        customClass: { popup: "rounded-4" },
      });
      return;
    }

    setCart(
      cart.map((item) => (item._id === id ? { ...item, quantity: qty } : item)),
    );
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-5 bg-white rounded-4 shadow-sm mt-4">
        <i className="bi bi-cart-x text-muted" style={{ fontSize: "5rem" }}></i>
        <h3 className="mt-3 text-muted fw-bold">Giỏ hàng đang trống</h3>
        <p className="text-muted">Bạn chưa thêm cuốn sách nào vào giỏ hàng.</p>
        <Link
          to="/"
          className="btn fw-bold text-white mt-2 rounded-pill px-5 py-2 shadow-sm"
          style={{ backgroundColor: "#0ea5e9" }}
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h2 className="fw-bold text-primary mb-4">
        <i className="bi bi-cart3"></i> Giỏ hàng của bạn
      </h2>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-0 table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="ps-4 py-3">
                      Sản phẩm
                    </th>
                    <th scope="col">Đơn giá</th>
                    <th scope="col" width="150">
                      Số lượng
                    </th>
                    <th scope="col" className="text-end pe-4">
                      Thành tiền
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item._id}>
                      <td className="ps-4 py-3 d-flex align-items-center gap-3 border-0">
                        <img
                          src={item.imageUrl}
                          className="rounded shadow-sm"
                          style={{
                            width: "60px",
                            height: "85px",
                            objectFit: "cover",
                          }}
                          alt={item.title}
                        />
                        <div>
                          <span className="fw-bold text-primary d-block">
                            {item.title}
                          </span>
                          <small className="text-muted">
                            Tồn kho: {item.stock || 100}
                          </small>
                        </div>
                      </td>
                      <td className="fw-bold text-muted border-0">
                        {item.price.toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="border-0">
                        <div
                          className="input-group input-group-sm"
                          style={{ maxWidth: "120px" }}
                        >
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item._id,
                                item.quantity - 1,
                                item.stock,
                              )
                            }
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className="form-control text-center fw-bold px-0"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                item._id,
                                e.target.value,
                                item.stock,
                              )
                            }
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item._id,
                                item.quantity + 1,
                                item.stock,
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="text-end pe-4 fw-bold text-danger fs-5 border-0">
                        {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="text-center border-0">
                        <button
                          className="btn text-danger"
                          onClick={() => removeItem(item._id)}
                          title="Xóa"
                        >
                          <i className="bi bi-trash fs-5"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div
            className="card border-0 shadow-sm rounded-4 p-4 sticky-top"
            style={{ top: "20px" }}
          >
            <h4 className="fw-bold mb-4 border-bottom pb-2">
              Tóm tắt đơn hàng
            </h4>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Số lượng mặt hàng:</span>
              <span className="fw-bold">{cart.length} sản phẩm</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Phí vận chuyển:</span>
              <span className="fw-bold text-success">Miễn phí</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between mb-4">
              <span className="fw-bold fs-5">TỔNG CỘNG:</span>
              <span className="fw-bold fs-4 text-danger">
                {totalPrice.toLocaleString("vi-VN")} ₫
              </span>
            </div>
            <Link
              to="/checkout"
              className="btn btn-lg w-100 fw-bold text-white shadow"
              style={{ background: "#0ea5e9", borderRadius: "12px" }}
            >
              TIẾN HÀNH THANH TOÁN <i className="bi bi-arrow-right"></i>
            </Link>
            <Link
              to="/"
              className="btn btn-link text-decoration-none w-100 mt-3 text-muted"
            >
              <i className="bi bi-arrow-left"></i> Tiếp tục mua sách
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
