import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer'; 
import PromoPopup from './components/PromoPopup'; 
import ChatWidget from './components/ChatWidget'; 
import Home from './pages/Home';
import Cart from './pages/Cart';
import BookDetail from './pages/BookDetail';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout'; 
import OrderSuccess from './pages/OrderSuccess';
import AdminDashboard from './pages/AdminDashboard';
import AdminChat from './pages/AdminChat'; 
import Policy from './pages/Policy'; 
import Reviews from './pages/Reviews'; // 🔥 Import trang Đánh giá Khách
import AdminReview from './pages/AdminReview'; // 🔥 Import trang Đánh giá Admin
import { CartProvider } from './context/CartContext';
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          {/* Popup quảng cáo hiện lên khi vừa vào web */}
          <PromoPopup /> 

          {/* Bóng chat góc phải màn hình */}
          <ChatWidget />
          
          <Header /> 
          
          <div className="container mt-4 mb-5" style={{ minHeight: '80vh' }}>
            <Routes>
              {/* Các trang dành cho khách hàng */}
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/book/:id" element={<BookDetail />} /> 
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/checkout" element={<Checkout />} /> 
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/policy/:type" element={<Policy />} /> 
              
              {/* 🔥 Trang khách hàng xem & gửi Review */}
              <Route path="/reviews" element={<Reviews />} />
              
              {/* Trang dành cho quản trị viên */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/chat" element={<AdminChat />} />
              
              {/* 🔥 Trang Admin quản lý Review */}
              <Route path="/admin/reviews" element={<AdminReview />} />
            </Routes>
          </div>

          <Footer />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;