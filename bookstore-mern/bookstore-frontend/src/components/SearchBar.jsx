import { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [text, setText] = useState('');

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    onSearch(val); // Truyền từ khóa về cho Home.jsx xử lý
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="input-group input-group-lg shadow-sm rounded-pill overflow-hidden border">
            <span className="input-group-text bg-white border-0 ps-4">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-0 py-3 shadow-none fs-6"
              placeholder="Tìm kiếm sách, tác giả, nội dung sách..."
              value={text}
              onChange={handleChange}
            />
            <button className="btn btn-primary px-4 fw-bold">
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;