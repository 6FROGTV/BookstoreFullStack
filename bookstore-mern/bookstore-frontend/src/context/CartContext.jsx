import { createContext, useState, useContext } from 'react';
import Swal from 'sweetalert2';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (book) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item._id === book._id);
      if (existingItem) {
        return prevCart.map(item =>
          item._id === book._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...book, quantity: 1 }];
    });
    
    // NÂNG CẤP: Thông báo Toast hiện đại
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Đã thêm "${book.title}" vào giỏ!`,
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, cartCount, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};