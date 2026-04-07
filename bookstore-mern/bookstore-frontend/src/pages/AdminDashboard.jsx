import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom'; 
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Swal from 'sweetalert2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]); 
  const [revenueData, setRevenueData] = useState(new Array(12).fill(0));
  
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catName, setCatName] = useState('');

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userData, setUserData] = useState({ name: '', email: '', password: '', role: 'user' });

  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookData, setBookData] = useState({ title: '', author: '', price: 0, stock: 0, discount: 0, imageUrl: '', categoryName: '', description: '' });

  useEffect(() => { 
    if (currentUser?.role === 'admin') fetchData(); 
  }, [currentUser]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const [resBooks, resUsers, resOrders, resStats, resCats] = await Promise.all([
        axios.get('http://192.168.1.12:5000/api/books'),
        axios.get('http://192.168.1.12:5000/api/admin/users', config),
        axios.get('http://192.168.1.12:5000/api/admin/orders', config),
        axios.get('http://192.168.1.12:5000/api/admin/revenue-stats', config),
        axios.get('http://192.168.1.12:5000/api/categories')
      ]);
      setBooks(resBooks.data);
      setUsers(resUsers.data);
      setOrders(resOrders.data);
      
      let cats = resCats.data.map(c => c.name);
      if (cats.length === 0) cats = [...new Set(resBooks.data.map(b => b.categoryName))];
      setCategoriesList(cats);

      const newStats = new Array(12).fill(0);
      resStats.data.forEach(item => { if(item._id <= 12) newStats[item._id - 1] = item.total; });
      setRevenueData(newStats);
    } catch (err) { console.error("Lỗi tải dữ liệu:", err); }
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      if (editingCat) {
        await axios.put('http://192.168.1.12:5000/api/admin/categories/rename', { oldName: editingCat, newName: catName }, config);
        Swal.fire('Thành công', 'Đã cập nhật tên danh mục!', 'success');
      } else {
        await axios.post('http://192.168.1.12:5000/api/admin/categories', { name: catName }, config);
        Swal.fire('Thành công', 'Đã thêm danh mục mới!', 'success');
      }
      setShowCatModal(false); setCatName(''); fetchData();
    } catch (err) { Swal.fire('Lỗi', 'Danh mục này có thể đã tồn tại!', 'error'); }
  };

  const deleteCategory = (name) => {
    Swal.fire({
      title: `Xóa danh mục ${name}?`,
      text: "Lưu ý: Bạn sẽ cần gán lại danh mục cho sách thuộc nhóm này!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'Đồng ý xóa',
      customClass: { popup: 'rounded-4' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        await axios.delete(`http://192.168.1.12:5000/api/admin/categories/${name}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
        Swal.fire('Đã xóa!', '', 'success');
      }
    });
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookData.imageUrl) return Swal.fire('Lỗi', 'Vui lòng chọn hình ảnh cho sách!', 'error');
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      if (editingBook) {
        await axios.put(`http://192.168.1.12:5000/api/admin/books/${editingBook._id}`, bookData, config);
        Swal.fire({ icon: 'success', title: 'Cập nhật thành công!', timer: 1500, showConfirmButton: false });
      } else {
        await axios.post('http://192.168.1.12:5000/api/admin/books', bookData, config);
        Swal.fire({ icon: 'success', title: 'Thêm mới thành công!', timer: 1500, showConfirmButton: false });
      }
      setShowBookModal(false); fetchData();
    } catch (err) { Swal.fire('Lỗi', 'Thao tác lưu sách thất bại!', 'error'); }
  };

  const deleteBook = (id) => {
    Swal.fire({
      title: 'Xóa cuốn sách này?',
      text: "Dữ liệu sẽ biến mất vĩnh viễn!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Xác nhận xóa',
      customClass: { popup: 'rounded-4' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        await axios.delete(`http://192.168.1.12:5000/api/admin/books/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
        Swal.fire('Đã xóa!', '', 'success');
      }
    });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      if (editingUser) {
        await axios.put(`http://192.168.1.12:5000/api/admin/users/${editingUser._id}`, userData, config);
        Swal.fire({ icon: 'success', title: 'Đã cập nhật tài khoản!', timer: 1500, showConfirmButton: false });
      } else {
        await axios.post('http://192.168.1.12:5000/api/auth/register', userData);
        Swal.fire({ icon: 'success', title: 'Đã tạo User mới!', timer: 1500, showConfirmButton: false });
      }
      setShowUserModal(false); fetchData();
    } catch (err) { Swal.fire('Lỗi', err.response?.data?.message || 'Thất bại!', 'error'); }
  };

  const deleteUser = (id) => {
    if (id === currentUser.id) return Swal.fire('Lỗi', 'Không thể tự xóa chính mình!', 'error');
    Swal.fire({
      title: 'Xóa thành viên này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Xóa ngay',
      customClass: { popup: 'rounded-4' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        await axios.delete(`http://192.168.1.12:5000/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
        Swal.fire('Thành công', 'Tài khoản đã bị gỡ bỏ.', 'success');
      }
    });
  };

  const updateOrderStatus = async (id, status) => {
    const token = localStorage.getItem('token');
    await axios.put(`http://192.168.1.12:5000/api/admin/orders/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã cập nhật', showConfirmButton: false, timer: 1500 });
    fetchData();
  };

  if (!currentUser || currentUser.role !== 'admin') return <Navigate to="/" />;

  const totalRevenue = orders.filter(o => o.status === 'Đã hoàn thành').reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="mt-4 pb-5">
      {/* 🔥 CẬP NHẬT: THÊM NÚT REVIEW CẠNH NÚT CHAT */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
        <h2 className="fw-bold text-danger m-0"><i className="bi bi-shield-lock-fill me-2"></i>TRUNG TÂM QUẢN TRỊ</h2>
        <div>
          <Link to="/admin/chat" className="btn btn-primary fw-bold shadow-sm rounded-pill px-4">
            <i className="bi bi-chat-dots-fill me-2"></i> Quản lý Chat
          </Link>
          <Link to="/admin/reviews" className="btn btn-warning fw-bold shadow-sm rounded-pill px-4 ms-2 text-dark">
            <i className="bi bi-star-fill me-2"></i> Quản lý Đánh giá
          </Link>
        </div>
      </div>

      <div className="row g-4">
        {/* CỘT TRÁI: SIDEBAR MENU */}
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 sticky-top" style={{top: '20px'}}>
            <div className="bg-dark text-white p-3 fw-bold rounded-top-4">
              <i className="bi bi-list-ul me-2"></i> DANH MỤC QUẢN LÝ
            </div>
            <div className="list-group list-group-flush rounded-bottom-4 p-2">
              <button onClick={() => setActiveTab('dashboard')} className={`list-group-item list-group-item-action border-0 py-3 mb-1 rounded-3 fw-bold transition-all ${activeTab === 'dashboard' ? 'active bg-primary shadow-sm' : 'text-muted'}`}>
                <i className="bi bi-speedometer2 me-3 fs-5"></i> Tổng quan
              </button>
              <button onClick={() => setActiveTab('books')} className={`list-group-item list-group-item-action border-0 py-3 mb-1 rounded-3 fw-bold transition-all ${activeTab === 'books' ? 'active bg-primary shadow-sm' : 'text-muted'}`}>
                <i className="bi bi-journal-album me-3 fs-5"></i> Quản lý Sách
              </button>
              <button onClick={() => setActiveTab('categories')} className={`list-group-item list-group-item-action border-0 py-3 mb-1 rounded-3 fw-bold transition-all ${activeTab === 'categories' ? 'active bg-primary shadow-sm' : 'text-muted'}`}>
                <i className="bi bi-tags me-3 fs-5"></i> Quản lý Danh mục
              </button>
              <button onClick={() => setActiveTab('orders')} className={`list-group-item list-group-item-action border-0 py-3 mb-1 rounded-3 fw-bold transition-all ${activeTab === 'orders' ? 'active bg-primary shadow-sm' : 'text-muted'}`}>
                <i className="bi bi-box-seam me-3 fs-5"></i> Đơn hàng
              </button>
              <button onClick={() => setActiveTab('users')} className={`list-group-item list-group-item-action border-0 py-3 rounded-3 fw-bold transition-all ${activeTab === 'users' ? 'active bg-primary shadow-sm' : 'text-muted'}`}>
                <i className="bi bi-people me-3 fs-5"></i> Tài khoản Users
              </button>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: NỘI DUNG */}
        <div className="col-lg-9">
          
          {/* TAB 1: TỔNG QUAN */}
          {activeTab === 'dashboard' && (
            <div className="animation-fade-in">
              <div className="row g-3 mb-4">
                <div className="col-sm-6 col-md-3">
                  <div className="card border-0 shadow-sm bg-primary text-white rounded-4 p-3 h-100 d-flex flex-row align-items-center">
                    <i className="bi bi-journal-text fs-1 opacity-50 me-3"></i>
                    <div><h4 className="fw-bold m-0">{books.length}</h4><small>Đầu sách</small></div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="card border-0 shadow-sm bg-success text-white rounded-4 p-3 h-100 d-flex flex-row align-items-center">
                    <i className="bi bi-cart-check fs-1 opacity-50 me-3"></i>
                    <div><h4 className="fw-bold m-0">{orders.length}</h4><small>Đơn hàng</small></div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="card border-0 shadow-sm bg-info text-white rounded-4 p-3 h-100 d-flex flex-row align-items-center">
                    <i className="bi bi-wallet2 fs-1 opacity-50 me-3"></i>
                    <div><h5 className="fw-bold m-0">{totalRevenue >= 1000000 ? (totalRevenue/1000000).toFixed(1) + ' Tr' : totalRevenue.toLocaleString()}</h5><small>Doanh thu</small></div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="card border-0 shadow-sm bg-secondary text-white rounded-4 p-3 h-100 d-flex flex-row align-items-center">
                    <i className="bi bi-people fs-1 opacity-50 me-3"></i>
                    <div><h4 className="fw-bold m-0">{users.length}</h4><small>Thành viên</small></div>
                  </div>
                </div>
              </div>
              <div className="card border-0 shadow-sm p-4 rounded-4" style={{ height: '420px' }}>
                <h5 className="fw-bold mb-4 text-dark"><i className="bi bi-graph-up-arrow text-primary me-2"></i> Biểu đồ doanh thu năm 2026</h5>
                <div style={{flex:1}}>
                  <Bar data={{ labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'], datasets: [{ label: 'Doanh thu (VNĐ)', data: revenueData, backgroundColor: '#0ea5e9', borderRadius: 6 }] }} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUẢN LÝ SÁCH */}
          {activeTab === 'books' && (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden animation-fade-in">
              <div className="p-3 bg-white border-bottom d-flex justify-content-between align-items-center">
                <h5 className="fw-bold m-0 text-primary">Danh sách đầu sách</h5>
                <button className="btn btn-primary btn-sm rounded-pill fw-bold px-4 shadow-sm" onClick={() => { setEditingBook(null); setBookData({title:'', author:'', price:0, stock:0, discount:0, imageUrl:'', categoryName: categoriesList[0] || '', description:''}); setShowBookModal(true); }}>+ Thêm sách</button>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light"><tr><th className="ps-4">Tựa sách</th><th>Giá & Sale</th><th>Tồn kho</th><th className="text-end pe-4">Thao tác</th></tr></thead>
                  <tbody>{books.map(b => (
                    <tr key={b._id}>
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center">
                          <img src={b.imageUrl} width="40" className="rounded shadow-sm me-3" style={{height:'55px', objectFit:'cover'}}/>
                          <div><strong className="d-block text-dark">{b.title}</strong><small className="text-muted">{b.categoryName}</small></div>
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{b.price.toLocaleString()} ₫</div>
                        {b.discount > 0 && <span className="badge bg-danger rounded-pill">-{b.discount}%</span>}
                      </td>
                      <td><span className={`badge ${b.stock > 10 ? 'bg-success' : 'bg-warning text-dark'}`}>{b.stock} quyển</span></td>
                      <td className="text-end pe-4">
                        <button className="btn btn-sm btn-light text-primary me-2 shadow-sm" onClick={() => { setEditingBook(b); setBookData(b); setShowBookModal(true); }}><i className="bi bi-pencil-square"></i></button>
                        <button className="btn btn-sm btn-light text-danger shadow-sm" onClick={() => deleteBook(b._id)}><i className="bi bi-trash"></i></button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: QUẢN LÝ DANH MỤC */}
          {activeTab === 'categories' && (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden animation-fade-in">
              <div className="p-3 bg-white border-bottom d-flex justify-content-between align-items-center">
                <h5 className="fw-bold m-0 text-primary">Phân loại danh mục</h5>
                <button className="btn btn-primary btn-sm rounded-pill fw-bold px-4 shadow-sm" onClick={() => { setEditingCat(null); setCatName(''); setShowCatModal(true); }}>+ Thêm mới</button>
              </div>
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light"><tr><th className="ps-4">Tên danh mục</th><th className="text-center">Số lượng sách</th><th className="text-end pe-4">Thao tác</th></tr></thead>
                <tbody>
                  {categoriesList.map(cat => (
                    <tr key={cat}>
                      <td className="ps-4 fw-bold py-3 text-dark">{cat}</td>
                      <td className="text-center"><span className="badge bg-info text-dark rounded-pill px-3">{books.filter(b => b.categoryName === cat).length} cuốn</span></td>
                      <td className="text-end pe-4">
                        <button className="btn btn-sm btn-light text-primary me-2 shadow-sm" onClick={() => { setEditingCat(cat); setCatName(cat); setShowCatModal(true); }}><i className="bi bi-pencil-square"></i></button>
                        <button className="btn btn-sm btn-light text-danger shadow-sm" onClick={() => deleteCategory(cat)}><i className="bi bi-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: QUẢN LÝ ĐƠN HÀNG */}
          {activeTab === 'orders' && (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden animation-fade-in">
              <div className="p-3 bg-white border-bottom"><h5 className="fw-bold m-0 text-primary">Theo dõi đơn hàng</h5></div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light"><tr><th className="ps-4">Mã đơn</th><th>Khách hàng</th><th>Tổng tiền</th><th className="text-center pe-4">Cập nhật Trạng thái</th></tr></thead>
                  <tbody>{orders.map(o => (
                    <tr key={o._id}>
                      <td className="ps-4 py-3 fw-bold text-secondary">#ORD-{o._id.slice(-6).toUpperCase()}</td>
                      <td>
                        <strong className="d-block">{o.customerName}</strong>
                        <small className="text-muted"><i className="bi bi-telephone-fill me-1"></i>{o.phone}</small>
                      </td>
                      <td className="text-danger fw-bold">{o.totalAmount.toLocaleString()} ₫</td>
                      <td className="text-center pe-4">
                        <select className={`form-select form-select-sm fw-bold shadow-sm ${o.status==='Đã hoàn thành' ? 'text-success' : o.status==='Đã hủy' ? 'text-danger' : 'text-warning'}`} value={o.status} onChange={(e) => updateOrderStatus(o._id, e.target.value)}>
                          <option value="Chờ xác nhận">Chờ xác nhận</option><option value="Đang giao hàng">Đang giao hàng</option><option value="Đã hoàn thành">Đã hoàn thành</option><option value="Đã hủy">Đã hủy</option>
                        </select>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: QUẢN LÝ TÀI KHOẢN */}
          {activeTab === 'users' && (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden animation-fade-in">
              <div className="p-3 bg-white border-bottom d-flex justify-content-between">
                <h5 className="fw-bold m-0 text-primary">Hồ sơ người dùng</h5>
                <button className="btn btn-dark btn-sm rounded-pill fw-bold px-4 shadow-sm" onClick={() => { setEditingUser(null); setUserData({name:'', email:'', password:'', role:'user'}); setShowUserModal(true); }}>+ Cấp tài khoản</button>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light"><tr><th className="ps-4">Thông tin</th><th>Phân quyền</th><th className="text-end pe-4">Thiết lập</th></tr></thead>
                  <tbody>{users.map(u => (
                    <tr key={u._id}>
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center">
                           <div className="bg-light rounded-circle d-flex justify-content-center align-items-center me-3" style={{width:'40px', height:'40px'}}><i className="bi bi-person fs-4 text-secondary"></i></div>
                           <div>
                             <div className="fw-bold text-dark">{u.name} {u._id === currentUser.id && <span className="badge bg-secondary ms-2" style={{fontSize: '10px'}}>Chính bạn</span>}</div>
                             <small className="text-muted">{u.email}</small>
                           </div>
                        </div>
                      </td>
                      <td><span className={`badge rounded-pill px-3 py-2 ${u.role === 'admin' ? 'bg-danger shadow-sm' : 'bg-success shadow-sm'}`}>{u.role.toUpperCase()}</span></td>
                      <td className="text-end pe-4">
                        <button className="btn btn-sm btn-light text-primary me-2 shadow-sm" onClick={() => { setEditingUser(u); setUserData({name: u.name, email: u.email, role: u.role, password: ''}); setShowUserModal(true); }}><i className="bi bi-pencil-square"></i></button>
                        <button className="btn btn-sm btn-light text-danger shadow-sm" onClick={() => deleteUser(u._id)}><i className="bi bi-trash"></i></button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* KHU VỰC CÁC MODAL */}
      {showCatModal && (
        <div className="modal d-block" style={{backgroundColor:'rgba(0,0,0,0.5)'}}><div className="modal-dialog modal-dialog-centered"><div className="modal-content border-0 shadow rounded-4"><form onSubmit={handleCatSubmit}><div className="modal-header border-0 pb-0"><h5 className="fw-bold text-primary">{editingCat ? '✏️ ĐỔI TÊN DANH MỤC' : '📁 THÊM DANH MỤC MỚI'}</h5><button type="button" className="btn-close" onClick={()=>setShowCatModal(false)}></button></div><div className="modal-body p-4">
          <label className="fw-bold small mb-2 text-muted text-uppercase">Tên phân loại</label>
          <input type="text" className="form-control rounded-3 py-2" value={catName} onChange={e=>setCatName(e.target.value)} placeholder="Nhập tên..." required/>
        </div><div className="modal-footer border-0 pb-4"><button type="submit" className="btn btn-primary w-100 rounded-pill shadow-sm fw-bold py-2">XÁC NHẬN LƯU</button></div></form></div></div></div>
      )}

      {showBookModal && (
        <div className="modal d-block" style={{backgroundColor:'rgba(0,0,0,0.6)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <form onSubmit={handleBookSubmit}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="fw-bold text-primary">{editingBook ? '✏️ SỬA THÔNG TIN SÁCH' : '📚 BỔ SUNG SÁCH'}</h5>
                  <button type="button" className="btn-close" onClick={()=>setShowBookModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6"><label className="fw-bold small text-muted">Tên sách</label><input type="text" className="form-control rounded-3" value={bookData.title} onChange={e=>setBookData({...bookData, title:e.target.value})} required/></div>
                    <div className="col-md-6"><label className="fw-bold small text-muted">Tác giả</label><input type="text" className="form-control rounded-3" value={bookData.author} onChange={e=>setBookData({...bookData, author:e.target.value})} required/></div>
                    <div className="col-md-4"><label className="fw-bold small text-muted">Giá niêm yết (VNĐ)</label><input type="number" className="form-control rounded-3" value={bookData.price} onChange={e=>setBookData({...bookData, price:e.target.value})} required/></div>
                    <div className="col-md-4"><label className="fw-bold small text-danger">Giảm giá % (Khuyến mãi)</label><input type="number" className="form-control border-danger rounded-3" value={bookData.discount} onChange={e=>setBookData({...bookData, discount:e.target.value})}/></div>
                    <div className="col-md-4">
                      <label className="fw-bold small text-muted">Danh mục</label>
                      <select className="form-select border-primary rounded-3" value={bookData.categoryName} onChange={e=>setBookData({...bookData, categoryName:e.target.value})} required>
                        <option value="">-- Chọn phân loại --</option>
                        {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    
                    <div className="col-md-4">
                      <label className="fw-bold small text-muted">Tồn kho</label>
                      <input type="number" className="form-control rounded-3" value={bookData.stock} onChange={e=>setBookData({...bookData, stock:e.target.value})} required/>
                    </div>
                    <div className="col-md-8">
                      <label className="fw-bold small text-muted">Hình ảnh sách (Chọn từ máy tính)</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="form-control rounded-3" 
                        onChange={e => {
                          if(e.target.files.length > 0) {
                            setBookData({...bookData, imageUrl: '/images/' + e.target.files[0].name});
                          }
                        }} 
                      />
                      {bookData.imageUrl && (
                        <div className="mt-2 p-2 bg-light rounded-3 small">
                          Đường dẫn lưu Database: <strong className="text-primary">{bookData.imageUrl}</strong><br/>
                          <span className="text-danger">* Nhớ copy ảnh này thả vào thư mục public/images nhé!</span>
                        </div>
                      )}
                    </div>

                    <div className="col-12"><label className="fw-bold small text-muted">Mô tả nội dung</label><textarea className="form-control rounded-3" rows="3" value={bookData.description} onChange={e=>setBookData({...bookData, description:e.target.value})}></textarea></div>
                  </div>
                </div>
                <div className="modal-footer border-0 pb-4"><button type="submit" className="btn btn-primary w-100 rounded-pill shadow-sm fw-bold py-2">CẬP NHẬT KHO SÁCH</button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="modal d-block" style={{backgroundColor:'rgba(0,0,0,0.6)'}}><div className="modal-dialog modal-dialog-centered"><div className="modal-content border-0 shadow-lg rounded-4"><form onSubmit={handleUserSubmit}><div className="modal-header border-0 pb-0"><h5 className="fw-bold text-primary">{editingUser ? '✏️ CẤP LẠI QUYỀN' : '👤 TẠO TÀI KHOẢN'}</h5><button type="button" className="btn-close" onClick={()=>setShowUserModal(false)}></button></div><div className="modal-body p-4"><div className="row g-3">
          <div className="col-12"><label className="fw-bold small mb-1 text-muted">Họ và tên</label><input type="text" className="form-control rounded-3" value={userData.name} onChange={e=>setUserData({...userData, name:e.target.value})} required/></div>
          <div className="col-12"><label className="fw-bold small mb-1 text-muted">Email</label><input type="email" className="form-control rounded-3" value={userData.email} onChange={e=>setUserData({...userData, email:e.target.value})} required disabled={editingUser}/></div>
          <div className="col-12"><label className="fw-bold small mb-1 text-muted">Mật khẩu {editingUser && '(Bỏ trống để giữ nguyên)'}</label><input type="password" placeholder="******" className="form-control rounded-3" value={userData.password} onChange={e=>setUserData({...userData, password:e.target.value})} required={!editingUser}/></div>
          <div className="col-12"><label className="fw-bold small mb-1 text-muted">Quyền hạn</label><select className="form-select border-primary rounded-3" value={userData.role} onChange={e=>setUserData({...userData, role:e.target.value})}><option value="user">Khách hàng (User)</option><option value="admin">Quản trị viên (Admin)</option></select></div>
        </div></div><div className="modal-footer border-0 pb-4"><button type="submit" className="btn btn-dark w-100 rounded-pill shadow-sm fw-bold py-2">XÁC NHẬN THIẾT LẬP</button></div></form></div></div></div>
      )}

      <style>{`
        .transition-all { transition: all 0.3s ease; }
        .animation-fade-in { animation: fadeIn 0.4s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default AdminDashboard;