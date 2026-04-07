import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Reviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const labels = { 1: 'Kém', 2: 'Trung bình', 3: 'Khá', 4: 'Tốt', 5: 'Xuất sắc' };

  const fetchReviews = async () => {
    try {
      const res = await axios.get('http://192.168.1.12:5000/api/reviews');
      setReviews(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return Swal.fire('Oops...', 'Bạn cần đăng nhập để đánh giá!', 'warning');
    if (!comment.trim()) return Swal.fire('Lỗi', 'Vui lòng nhập bình luận!', 'warning');
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://192.168.1.12:5000/api/reviews', { rating, comment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews([res.data, ...reviews]);
      setComment('');
      setRating(5);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cảm ơn đánh giá của bạn!', showConfirmButton: false, timer: 2000 });
    } catch (err) {
      Swal.fire('Lỗi', 'Không thể gửi đánh giá!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-primary"><i className="bi bi-star-fill text-warning me-2"></i> Đánh Giá Cửa Hàng</h2>
          <p className="text-muted">Cảm ơn bạn đã đồng hành cùng Web Bán Sách. Hãy để lại nhận xét nhé!</p>
        </div>
        
        {/* Form Viết Đánh Giá */}
        <div className="bg-light p-4 rounded-4 mb-5 border shadow-sm">
          <h5 className="fw-bold mb-3">Gửi nhận xét của bạn</h5>
          <form onSubmit={handleSubmit}>
            <div className="d-flex align-items-center mb-3">
              <div className="me-3" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <i key={star} 
                     className={`bi fs-2 ${star <= (hoverRating || rating) ? 'bi-star-fill text-warning' : 'bi-star text-secondary'}`}
                     style={{ cursor: 'pointer', transition: '0.2s', marginRight: '5px' }}
                     onClick={() => setRating(star)}
                     onMouseEnter={() => setHoverRating(star)}>
                  </i>
                ))}
              </div>
              <span className="badge bg-primary px-3 py-2 fs-6">{labels[hoverRating || rating]}</span>
            </div>
            <textarea className="form-control rounded-3 mb-3 border-0 shadow-sm" rows="3" placeholder="Chia sẻ trải nghiệm mua sắm của bạn tại đây..." value={comment} onChange={(e) => setComment(e.target.value)} disabled={!user}></textarea>
            <button type="submit" className="btn btn-primary fw-bold rounded-pill px-5 shadow-sm" disabled={isSubmitting || !user}>
              {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
            {!user && <small className="text-danger ms-3">Vui lòng đăng nhập để nhận xét.</small>}
          </form>
        </div>

        {/* Danh sách Đánh giá */}
        <div className="review-list">
          <h5 className="fw-bold mb-4 border-bottom pb-2">Tất cả nhận xét ({reviews.length})</h5>
          {reviews.length === 0 ? <p className="text-muted text-center py-4">Chưa có đánh giá nào. Hãy là người đầu tiên!</p> : null}
          {reviews.map((rev) => (
            <div key={rev._id} className="d-flex mb-4 border-bottom pb-4">
              <img src={rev.user?.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} alt="Avatar" className="rounded-circle me-3 border shadow-sm" style={{ width: '55px', height: '55px', objectFit: 'cover' }} />
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold m-0 fs-5">{rev.user?.name || 'Khách hàng Ẩn danh'}</h6>
                  <small className="text-muted">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</small>
                </div>
                <div className="text-warning my-2" style={{ fontSize: '16px' }}>
                  {[...Array(5)].map((_, i) => <i key={i} className={`bi ${i < rev.rating ? 'bi-star-fill' : 'bi-star'} me-1`}></i>)}
                  <span className="ms-2 text-dark small fw-bold bg-light px-2 rounded">{labels[rev.rating]}</span>
                </div>
                <p className="m-0 text-dark mt-2" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{rev.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reviews;