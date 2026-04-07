import { useState, useEffect } from 'react';
import axios from 'axios';
import BookCard from '../components/BookCard';
import Banner from '../components/Banner'; 
import SearchBar from '../components/SearchBar';
import PromoPopup from '../components/PromoPopup';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]); 
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔥 Chờ lấy xong cả sách và danh mục cùng lúc
        const [resBooks, resCats] = await Promise.all([
          axios.get('http://192.168.1.12:5000/api/books'),
          axios.get('http://192.168.1.12:5000/api/categories')
        ]);
        
        setBooks(resBooks.data);
        setFilteredBooks(resBooks.data);
        
        // Lấy tên danh mục từ Database
        let catNames = resCats.data.map(c => c.name);
        
        // Cứu cánh: Nếu Collection danh mục chưa có gì, lấy tạm từ dữ liệu sách
        if(catNames.length === 0) {
           catNames = [...new Set(resBooks.data.map(book => book.categoryName))];
        }
        
        setCategories(['Tất cả', ...catNames]);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
    filterBooks(selectedCategory, term);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterBooks(category, searchTerm);
  };

  // 🔥 ĐÃ NÂNG CẤP HÀM TÌM KIẾM TẠI ĐÂY
  const filterBooks = (category, term) => {
    let results = books;
    
    // 1. Lọc theo danh mục trước
    if (category !== 'Tất cả') {
      results = results.filter(b => b.categoryName === category);
    }
    
    // 2. Lọc theo từ khóa (Quét qua Tên sách, Tác giả và Nội dung)
    if (term) {
      const lowerTerm = term.toLowerCase(); // Chuyển từ khóa về chữ thường để dễ so sánh
      
      results = results.filter(b => {
        // Kiểm tra xem từ khóa có nằm trong title, author hoặc description không
        // Dùng optional chaining (?.) đề phòng trường hợp database bị thiếu trường dữ liệu
        const matchTitle = b.title?.toLowerCase().includes(lowerTerm);
        const matchAuthor = b.author?.toLowerCase().includes(lowerTerm);
        const matchDesc = b.description?.toLowerCase().includes(lowerTerm);
        
        // Chỉ cần 1 trong 3 trường trùng khớp là lấy cuốn sách đó
        return matchTitle || matchAuthor || matchDesc;
      });
    }
    
    setFilteredBooks(results);
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="pb-5">
      <PromoPopup />
      <Banner />
      <SearchBar onSearch={handleSearch} />
      <div className="row mt-5">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 sticky-top" style={{top: '20px'}}>
            <h5 className="fw-bold text-primary mb-3"><i className="bi bi-grid-fill me-2"></i>Danh mục</h5>
            <div className="list-group list-group-flush">
              {categories.map(cat => (
                <button key={cat} className={`list-group-item list-group-item-action border-0 rounded-3 mb-1 fw-bold ${selectedCategory === cat ? 'active bg-primary shadow-sm' : 'text-muted'}`} onClick={() => handleCategoryChange(cat)}>{cat}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="col-md-9">
          <h3 className="fw-bold mb-4">{selectedCategory} ({filteredBooks.length} cuốn)</h3>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
            {filteredBooks.map(book => (
              <div className="col" key={book._id}>
                <BookCard book={book} /> 
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Home;