const mongoose = require('mongoose');
require('dotenv').config();
const Book = require('./models/Book');
const Category = require('./models/Category'); // 🔥 Khai báo thêm Model Category

// Dữ liệu 30 cuốn sách đã được cập nhật trường "discount" để khớp với Model


const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📦 Đang kết nối Database MongoDB...');

        // 1. Xóa sạch dữ liệu sách và danh mục cũ để làm mới từ đầu
        await Book.deleteMany(); 
        await Category.deleteMany();
        console.log('🗑️ Đã xóa sạch dữ liệu sách và danh mục cũ!');

        // 2. Trích xuất các danh mục duy nhất từ mảng sampleBooks và bơm vào Model Category
        const uniqueCategoryNames = [...new Set(sampleBooks.map(book => book.categoryName))];
        const categoryData = uniqueCategoryNames.map(name => ({ name: name }));
        
        await Category.insertMany(categoryData);
        console.log(`✅ Đã bơm thành công ${uniqueCategoryNames.length} danh mục vào MongoDB!`);

        // 3. Bơm dữ liệu sách với trường "discount" chuẩn vào Model Book
        await Book.insertMany(sampleBooks);
        console.log('✅ ĐÃ BƠM XONG 30 CUỐN SÁCH KÈM GIẢM GIÁ CỰC CHUẨN VÀO MONGODB! ======');

        process.exit(); 
    } catch (error) {
        console.error('🚨 Lỗi khi bơm dữ liệu:', error);
        process.exit(1);
    }
};

seedData();