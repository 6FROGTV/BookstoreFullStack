import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const BookCard = ({ book }) => {
  const { addToCart } = useCart();
  
  // Tính giá sau khi đã giảm
  const salePrice = book.price * (1 - (book.discount || 0) / 100);

  return (
    <div className="card h-100 shadow-sm border-0 rounded-4 transition-hover position-relative">
      {/* Hiện nhãn giảm giá ở góc ảnh nếu có discount */}
      {book.discount > 0 && (
        <span className="position-absolute top-0 start-0 badge bg-danger m-2 rounded-pill shadow-sm" style={{ zIndex: 1 }}>
          -{book.discount}%
        </span>
      )}

      <Link to={`/book/${book._id}`}>
        <img src={book.imageUrl} className="card-img-top p-3" style={{ height: '200px', objectFit: 'contain' }} alt={book.title} />
      </Link>

      <div className="card-body d-flex flex-column text-center">
        <h6 className="fw-bold text-truncate" title={book.title}>{book.title}</h6>
        
        <div className="mb-3">
          {/* Giá mới màu đỏ rực */}
          <div className="text-danger fw-bold fs-5">{salePrice.toLocaleString()} ₫</div>
          
          {/* Giá cũ gạch ngang nếu có giảm giá */}
          {book.discount > 0 && (
            <small className="text-muted text-decoration-line-through">
              {book.price.toLocaleString()} ₫
            </small>
          )}
        </div>

        <button 
          onClick={() => addToCart(book)} 
          className="btn btn-outline-primary btn-sm rounded-pill mt-auto fw-bold"
        >
          + Thêm vào giỏ
        </button>
      </div>
    </div>
  );
};

export default BookCard;