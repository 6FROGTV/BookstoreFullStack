import Swal from 'sweetalert2';

// Thông báo Toast (nhỏ, tự mất ở góc màn hình)
export const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

// Thông báo Popup thành công/thất bại
export const showAlert = (title, text, icon = 'success') => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonColor: '#0ea5e9',
    confirmButtonText: 'Đồng ý',
    customClass: {
      popup: 'rounded-4'
    }
  });
};

// Hộp thoại xác nhận xóa
export const showConfirm = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Xóa ngay',
    cancelButtonText: 'Hủy bỏ',
    customClass: {
      popup: 'rounded-4'
    }
  });
};