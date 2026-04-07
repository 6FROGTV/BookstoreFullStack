import { useEffect } from 'react';
import Swal from 'sweetalert2';

const PromoPopup = () => {
  useEffect(() => {
    const hasShown = sessionStorage.getItem('promoShown');
    if (!hasShown) {
      Swal.fire({
        title: '🎉 TIỆC SALE CUỐI NĂM!',
        text: 'Giảm giá cực sốc đến 20% cho toàn bộ đầu sách mới nhất!',
        imageUrl: 'https://img.freepik.com/free-vector/sale-banner-template-design_74217-1.jpg',
        imageWidth: 400,
        confirmButtonText: 'MUA NGAY',
        confirmButtonColor: '#ff4757',
        customClass: { popup: 'rounded-4' }
      });
      sessionStorage.setItem('promoShown', 'true');
    }
  }, []);
  return null;
};
export default PromoPopup;