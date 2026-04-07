import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const BookDetail = () => {
  const { id } = useParams(); // Lấy cái ID từ trên thanh URL xuống
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { addToCart } = useCart(); // Lôi hàm thêm giỏ hàng ra xài

  useEffect(() => {
    // Gọi API xin Backend chi tiết cuốn sách này
    axios.get(`http://192.168.1.12:5000/api/books/${id}`)
      .then(response => {
        setBook(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Lỗi lấy chi tiết sách:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (!book) return <h3 className="text-center mt-5 text-danger">Không tìm thấy cuốn sách này!</h3>;

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 mt-4">
      {/* Thanh điều hướng Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb mb-4">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Trang chủ</Link></li>
          <li className="breadcrumb-item text-muted">{book.categoryName}</li>
          <li className="breadcrumb-item active fw-bold" aria-current="page">{book.title}</li>
        </ol>
      </nav>

      <div className="row g-5">
        {/* CỘT TRÁI: ẢNH SÁCH */}
        <div className="col-md-5 text-center">
          <img 
            src={book.imageUrl} 
            alt={book.title} 
            className="img-fluid rounded-4 shadow-sm" 
            style={{ maxHeight: '450px', objectFit: 'contain' }} 
          />
        </div>

        {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
        <div className="col-md-7">
          <span className="badge bg-info text-dark mb-2 px-3 py-2 rounded-pill">{book.categoryName}</span>
          <h1 className="fw-bold text-primary mb-3">{book.title}</h1>
          <h5 className="text-muted mb-4">Tác giả: <span className="text-dark fw-bold">{book.author}</span></h5>
          
          <h2 className="fw-bold text-danger mb-4">
            {book.price.toLocaleString('vi-VN')} ₫
          </h2>

          <div className="bg-light p-4 rounded-4 mb-4">
            <h5 className="fw-bold mb-3"><i className="bi bi-info-circle"></i> Giới thiệu nội dung</h5>
            <p className="text-secondary mb-0" style={{ lineHeight: '1.8', textAlign: 'justify' }}>
              {book.description}
            </p>
          </div>

          <div className="d-flex gap-3 mt-4">
            <button 
              className="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow"
              onClick={() => addToCart(book)}
            >
              <i className="bi bi-cart-plus me-2"></i> Thêm vào giỏ
            </button>
            <Link to="/cart" className="btn btn-outline-success btn-lg rounded-pill px-5 fw-bold">
              Xem giỏ hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;