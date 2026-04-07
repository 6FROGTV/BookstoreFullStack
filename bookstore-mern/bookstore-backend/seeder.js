const mongoose = require('mongoose');
require('dotenv').config();
const Book = require('./models/Book');
const Category = require('./models/Category'); // 🔥 Khai báo thêm Model Category

// Dữ liệu 30 cuốn sách đã được cập nhật trường "discount" để khớp với Model
const sampleBooks = [
    // Danh mục 1: Văn học trong nước
    { title: "Dế Mèn Phiêu Lưu Ký", author: "Tô Hoài", price: 50000, stock: 100, discount: 0, imageUrl: "/images/sach1.jpg", categoryName: "Văn học trong nước", description: "Tác phẩm kinh điển gắn liền với tuổi thơ của biết bao thế hệ người Việt. Cuộc phiêu lưu kỳ thú của chú Dế Mèn sẽ mang đến những bài học sâu sắc về tình bạn và lý tưởng sống." },
    { title: "Mắt Biếc", author: "Nguyễn Nhật Ánh", price: 110000, stock: 50, discount: 10, imageUrl: "/images/sach2.webp", categoryName: "Văn học trong nước", description: "Một câu chuyện tình buồn, trong trẻo và day dứt của Ngạn dành cho Hà Lan. Tác phẩm đưa người đọc lên chuyến tàu về lại tuổi thơ nơi làng Đo Đo mộc mạc." },
    { title: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh", author: "Nguyễn Nhật Ánh", price: 95000, stock: 45, discount: 0, imageUrl: "/images/sach3.jpg", categoryName: "Văn học trong nước", description: "Những trang sách mở ra một thế giới tuổi thơ hồn nhiên, pha lẫn những rung động đầu đời và tình cảm anh em sâu sắc, cảm động." },
    { title: "Số Đỏ", author: "Vũ Trọng Phụng", price: 60000, stock: 30, discount: 20, imageUrl: "/images/sach4.jpg", categoryName: "Văn học trong nước", description: "Kiệt tác trào phúng đỉnh cao của văn học Việt Nam. Khắc họa chân dung Xuân Tóc Đỏ và một xã hội lố lăng, kệch cỡm thời bấy giờ." },
    { title: "Đất Rừng Phương Nam", author: "Đoàn Giỏi", price: 75000, stock: 80, discount: 15, imageUrl: "/images/sach5.jpg", categoryName: "Văn học trong nước", description: "Hành trình tìm cha đầy gian truân nhưng cũng vô cùng kỳ thú của cậu bé An giữa thiên nhiên miền Tây Nam Bộ hoang sơ và hào sảng." },
    { title: "Tuổi Thơ Dữ Dội", author: "Phùng Quán", price: 85000, stock: 60, discount: 0, imageUrl: "/images/sach6.jpg", categoryName: "Văn học trong nước", description: "Khúc tráng ca hào hùng và bi thương về đội thiếu niên trinh sát Trần Cao Vân. Một cuốn sách lấy đi nước mắt của hàng triệu độc giả." },

    // Danh mục 2: Kỹ năng sống
    { title: "Đắc Nhân Tâm", author: "Dale Carnegie", price: 80000, stock: 120, discount: 20, imageUrl: "/images/sach7.webp", categoryName: "Kỹ năng sống", description: "Cuốn sách nghệ thuật giao tiếp kinh điển nhất mọi thời đại. Giúp bạn thấu hiểu tâm lý con người và xây dựng các mối quan hệ bền chặt." },
    { title: "Tuổi Trẻ Đáng Giá Bao Nhiêu", author: "Rosie Nguyễn", price: 90000, stock: 100, discount: 10, imageUrl: "/images/sach8.webp", categoryName: "Kỹ năng sống", description: "Cẩm nang dẫn đường cho những người trẻ đang chênh vênh. Truyền cảm hứng để bạn dám dấn thân, học hỏi và cháy hết mình với đam mê." },
    { title: "Nhà Giả Kim", author: "Paulo Coelho", price: 79000, stock: 150, discount: 25, imageUrl: "/images/sach9.jpg", categoryName: "Kỹ năng sống", description: "Cuộc hành trình theo đuổi giấc mơ của cậu bé chăn cừu Santiago. Cuốn sách mang tính triết lý sâu sắc, thúc đẩy bạn lắng nghe trái tim mình." },
    { title: "Nghệ Thuật Tinh Tế Của Việc Đếch Quan Tâm", author: "Mark Manson", price: 120000, stock: 70, discount: 0, imageUrl: "/images/sach10.jpg", categoryName: "Kỹ năng sống", description: "Góc nhìn thực tế, thô nhưng thật về cách đối mặt với những khó khăn trong đời. Dạy bạn cách lựa chọn những điều thực sự đáng để quan tâm." },
    { title: "Sức Mạnh Của Thói Quen", author: "Charles Duhigg", price: 150000, stock: 50, discount: 30, imageUrl: "/images/sach11.jpg", categoryName: "Kỹ năng sống", description: "Khám phá cơ chế hình thành thói quen trong não bộ. Chìa khóa để thay đổi bản thân, từ bỏ thói quen xấu và xây dựng những thói quen thành công." },
    { title: "Tư Duy Nhanh Và Chậm", author: "Daniel Kahneman", price: 200000, stock: 40, discount: 40, imageUrl: "/images/sach12.webp", categoryName: "Kỹ năng sống", description: "Phân tích hai hệ thống tư duy chi phối con người. Giúp bạn hiểu rõ tại sao chúng ta lại đưa ra những quyết định sai lầm và cách khắc phục." },

    // Danh mục 3: Kinh tế - Kinh doanh
    { title: "Cha Giàu Cha Nghèo", author: "Robert Kiyosaki", price: 110000, stock: 90, discount: 20, imageUrl: "/images/sach13.webp", categoryName: "Kinh tế - Kinh doanh", description: "Bài học vỡ lòng về giáo dục tài chính. Thay đổi hoàn toàn tư duy của bạn về tiền bạc, tài sản và cách bắt tiền làm việc cho mình." },
    { title: "Chiến Tranh Tiền Tệ", author: "Song Hongbing", price: 160000, stock: 60, discount: 10, imageUrl: "/images/sach14.webp", categoryName: "Kinh tế - Kinh doanh", description: "Mở ra bức màn bí mật về sự vận hành của dòng tiền toàn cầu. Những thế lực ngầm đang điều khiển nền kinh tế thế giới như thế nào?" },
    { title: "Từ Tốt Đến Vĩ Đại", author: "Jim Collins", price: 135000, stock: 55, discount: 0, imageUrl: "/images/sach15.webp", categoryName: "Kinh tế - Kinh doanh", description: "Nghiên cứu kinh điển về cách các công ty bình thường vươn lên thành những đế chế vĩ đại trường tồn. Tài liệu gối đầu giường cho các CEO." },
    { title: "Khởi Nghiệp Tinh Gọn", author: "Eric Ries", price: 145000, stock: 45, discount: 40, imageUrl: "/images/sach16.webp", categoryName: "Kinh tế - Kinh doanh", description: "Phương pháp xây dựng doanh nghiệp đổi mới sáng tạo, giảm thiểu rủi ro và tiết kiệm chi phí. Bí kíp sinh tồn cho các startup hiện đại." },
    { title: "Tư Duy Ngược", author: "Nguyễn Anh Dũng", price: 95000, stock: 110, discount: 15, imageUrl: "/images/sach17.jpg", categoryName: "Kinh tế - Kinh doanh", description: "Phá vỡ những lối mòn trong tư duy thông thường. Dạy bạn cách nhìn nhận vấn đề từ nhiều góc độ khác nhau để tìm ra hướng đi đột phá." },
    { title: "Những Kẻ Xuất Chúng", author: "Malcolm Gladwell", price: 155000, stock: 65, discount: 0, imageUrl: "/images/sach18.webp", categoryName: "Kinh tế - Kinh doanh", description: "Giải mã bí mật đằng sau thành công của những vĩ nhân. Phân tích tác động của hoàn cảnh, văn hóa và quy tắc 10.000 giờ luyện tập." },

    // Danh mục 4: Sách ngoại ngữ
    { title: "Hack Não 1500 Từ Vựng", author: "Nguyễn Văn Hiệp", price: 395000, stock: 200, discount: 30, imageUrl: "/images/sach19.jpg", categoryName: "Sách ngoại ngữ", description: "Phương pháp học từ vựng bằng âm thanh tương tự và truyện chêm, giúp não bộ ghi nhớ siêu tốc 1500 từ vựng tiếng Anh chỉ trong 50 ngày." },
    { title: "Mindset For IELTS", author: "Cambridge", price: 250000, stock: 80, discount: 20, imageUrl: "/images/sach20.webp", categoryName: "Sách ngoại ngữ", description: "Bộ giáo trình chuẩn từ Đại học Cambridge. Cung cấp nền tảng tư duy và kỹ năng toàn diện để chinh phục kỳ thi IELTS đạt điểm cao." },
    { title: "Destination B1", author: "Malcom Mann", price: 180000, stock: 75, discount: 0, imageUrl: "/images/sach21.webp", categoryName: "Sách ngoại ngữ", description: "Tài liệu ôn tập ngữ pháp và từ vựng kinh điển dành cho người học tiếng Anh trình độ trung cấp. Rất phù hợp để luyện thi THPT và chứng chỉ." },
    { title: "English Grammar in Use", author: "Raymond Murphy", price: 210000, stock: 90, discount: 15, imageUrl: "/images/sach22.webp", categoryName: "Sách ngoại ngữ", description: "Cuốn sách ngữ pháp tự học bán chạy nhất thế giới. Giải thích rõ ràng, dễ hiểu kèm bài tập thực hành áp dụng ngay lập tức." },
    { title: "Tự Học Tiếng Trung Giao Tiếp", author: "Trang Nguyễn", price: 120000, stock: 60, discount: 25, imageUrl: "/images/sach23.jpg", categoryName: "Sách ngoại ngữ", description: "Giáo trình thiết kế tối ưu cho người tự học. Tập trung vào các mẫu câu giao tiếp thông dụng hàng ngày trong đời sống và công việc." },
    { title: "Oxford Thương Yêu", author: "Dương Thụy", price: 85000, stock: 40, discount: 10, imageUrl: "/images/sach24.webp", categoryName: "Sách ngoại ngữ", description: "Câu chuyện tình yêu lãng mạn và hành trình du học đầy nỗ lực của cô gái Việt tại Đại học Oxford. Truyền cảm hứng mạnh mẽ cho giới trẻ." },

    // Danh mục 5: Sách thiếu nhi
    { title: "Harry Potter và Hòn Đá Phù Thủy", author: "J.K. Rowling", price: 150000, stock: 100, discount: 10, imageUrl: "/images/sach25.jpg", categoryName: "Sách thiếu nhi", description: "Mở ra thế giới phép thuật kỳ diệu cùng cậu bé phù thủy Harry Potter. Cuốn sách gắn liền với tuổi thơ của hàng triệu trẻ em trên thế giới." },
    { title: "Hoàng Tử Bé", author: "Antoine de Saint-Exupéry", price: 65000, stock: 120, discount: 0, imageUrl: "/images/sach26.jpg", categoryName: "Sách thiếu nhi", description: "Câu chuyện ngụ ngôn đầy chất thơ về tình yêu, sự trưởng thành và bản chất của con người, được kể qua góc nhìn trong sáng của một cậu bé." },
    { title: "Chuyện Con Mèo Dạy Hải Âu Bay", author: "Luis Sepúlveda", price: 75000, stock: 85, discount: 20, imageUrl: "/images/sach27.webp", categoryName: "Sách thiếu nhi", description: "Tác phẩm cảm động về tình mẫu tử khác loài và tầm quan trọng của việc giữ lời hứa. Dạy trẻ em biết yêu thương và trân trọng môi trường." },
    { title: "Totto-chan Bên Cửa Sổ", author: "Tetsuko Kuroyanagi", price: 95000, stock: 70, discount: 15, imageUrl: "/images/sach28.jpg", categoryName: "Sách thiếu nhi", description: "Hồi ký về ngôi trường Tomoe kỳ diệu ở Nhật Bản. Minh chứng cho một phương pháp giáo dục tuyệt vời, tôn trọng và yêu thương trẻ em." },
    { title: "Cây Cam Ngọt Của Tôi", author: "José Mauro", price: 105000, stock: 95, discount: 40, imageUrl: "/images/sach29.jpg", categoryName: "Sách thiếu nhi", description: "Câu chuyện lấy đi nhiều nước mắt về cậu bé Zézé nghèo khó nhưng giàu trí tưởng tượng. Khắc họa vẻ đẹp của sự thấu hiểu và sẻ chia." },
    { title: "Nhóc Nicolas", author: "René Goscinny", price: 80000, stock: 50, discount: 0, imageUrl: "/images/sach30.jpeg", categoryName: "Sách thiếu nhi", description: "Tuyển tập những câu chuyện hài hước, đáng yêu về cậu nhóc Nicolas và đám bạn. Một góc nhìn hóm hỉnh về thế giới tuổi thơ ngây ngô." }
];

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