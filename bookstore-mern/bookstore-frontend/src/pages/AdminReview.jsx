import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const AdminReview = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [filterRating, setFilterRating] = useState('all');

  const fetchReviews = async () => {
    try {
      const res = await axios.get('http://192.168.1.12:5000/api/reviews');
      setReviews(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Xóa đánh giá này?',
      text: "Hành động này không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Đồng ý Xóa'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://192.168.1.12:5000/api/admin/reviews/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchReviews();
          Swal.fire('Đã xóa!', 'Đánh giá đã bị gỡ bỏ.', 'success');
        } catch (err) { Swal.fire('Lỗi', 'Không thể xóa đánh giá', 'error'); }
      }
    });
  };

  if (user?.role !== 'admin') return <Navigate to="/" />;

  // Lọc đánh giá theo sao
  const filteredReviews = filterRating === 'all' ? reviews : reviews.filter(r => r.rating === parseInt(filterRating));

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
        <h2 className="fw-bold text-primary m-0"><i className="bi bi-star-half me-2"></i> QUẢN LÝ ĐÁNH GIÁ</h2>
        <Link to="/admin" className="btn btn-outline-secondary fw-bold rounded-pill px-4">
           <i className="bi bi-arrow-left me-2"></i> Quay lại Dashboard
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold m-0">Tất cả nhận xét ({filteredReviews.length})</h5>
            <select className="form-select w-auto fw-bold text-warning border-warning shadow-sm rounded-pill" value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
                <option value="all" className="text-dark">Tất cả số sao</option>
                <option value="5" className="text-dark">5 Sao (Xuất sắc)</option>
                <option value="4" className="text-dark">4 Sao (Tốt)</option>
                <option value="3" className="text-dark">3 Sao (Khá)</option>
                <option value="2" className="text-dark">2 Sao (Trung bình)</option>
                <option value="1" className="text-dark">1 Sao (Kém)</option>
            </select>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Khách hàng</th>
                <th>Đánh giá</th>
                <th>Bình luận</th>
                <th>Ngày đăng</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length === 0 && <tr><td colSpan="5" className="text-center text-muted py-4">Không có đánh giá nào phù hợp.</td></tr>}
              {filteredReviews.map(rev => (
                <tr key={rev._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <img src={rev.user?.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} className="rounded-circle border me-2" style={{width: '35px', height: '35px', objectFit: 'cover'}} />
                      <strong>{rev.user?.name || 'Khách Ẩn danh'}</strong>
                    </div>
                  </td>
                  <td className="text-warning">
                    {[...Array(rev.rating)].map((_, i) => <i key={i} className="bi bi-star-fill"></i>)}
                  </td>
                  <td style={{ maxWidth: '300px', whiteSpace: 'pre-wrap' }}>{rev.comment}</td>
                  <td className="text-muted small">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-danger shadow-sm" onClick={() => handleDelete(rev._id)}><i className="bi bi-trash"></i> Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReview;