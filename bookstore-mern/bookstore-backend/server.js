const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config(); 

const app = express();
app.use(cors()); 

// 🔥 MỞ RỘNG LIMIT ĐỂ NHẬN ẢNH BÊN CHAT VÀ PROFILE
app.use(express.json({ limit: '100mb' })); 
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// KẾT NỐI DATABASE MONGODB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('📦 Đã kết nối thành công với MongoDB!'))
    .catch((err) => console.error('🚨 Lỗi kết nối MongoDB:', err));

const Book = require('./models/Book');
const User = require('./models/User');
const Category = require('./models/Category'); 

// 1. MODEL ORDER (ĐƠN HÀNG)
const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: String,
    phone: String,
    address: String,
    paymentMethod: String,
    note: String,
    items: Array,
    totalAmount: Number,
    pointsUsed: { type: Number, default: 0 },   
    pointsEarned: { type: Number, default: 0 }, 
    status: { type: String, default: 'Chờ xác nhận' },
    createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// 2. MODEL MESSAGE (TIN NHẮN CHAT CÓ FILE ĐÍNH KÈM)
const messageSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: String, enum: ['user', 'admin'], required: true },
    text: { type: String, default: '' },
    attachmentUrl: { type: String, default: '' }, // Chứa mã Base64 của file/ảnh
    attachmentType: { type: String, default: '' }, // 'image' hoặc 'file'
    createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// 3. MODEL REVIEW (ĐÁNH GIÁ 5 SAO)
const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const Review = mongoose.model('Review', reviewSchema);

// ==========================================
// MIDDLEWARE (BẢO MẬT)
// ==========================================
const protect = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: "Vui lòng đăng nhập!" });
    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded; 
        next(); 
    } catch (err) {
        res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); 
    } else {
        res.status(403).json({ message: "Quyền truy cập bị từ chối! Bạn không phải Admin." });
    }
};

// ==========================================
// 🔥 API REVIEW (ĐÁNH GIÁ CỬA HÀNG)
// ==========================================
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find().populate('user', 'name avatar').sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) { res.status(500).json({ message: "Lỗi tải đánh giá" }); }
});

app.post('/api/reviews', protect, async (req, res) => {
    try {
        const newReview = new Review({ user: req.user.id, rating: req.body.rating, comment: req.body.comment });
        await newReview.save();
        const populatedReview = await Review.findById(newReview._id).populate('user', 'name avatar');
        res.status(201).json(populatedReview);
    } catch (err) { res.status(500).json({ message: "Lỗi gửi đánh giá" }); }
});

app.delete('/api/admin/reviews/:id', protect, isAdmin, async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa đánh giá thành công!" });
    } catch (err) { res.status(500).json({ message: "Lỗi xóa đánh giá" }); }
});

// ==========================================
// 🔥 API CHAT (HỖ TRỢ FILE, ẢNH & BLOCK USER)
// ==========================================
app.get('/api/chat', protect, async (req, res) => {
    try {
        const userId = req.user.role === 'admin' ? req.query.userId : req.user.id;
        if (!userId) return res.json([]);
        const messages = await Message.find({ user: userId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) { res.status(500).json({ message: "Lỗi lấy tin nhắn" }); }
});

app.post('/api/chat', protect, async (req, res) => {
    try {
        // Kiểm tra xem User có bị block không trước khi gửi tin
        const targetUserId = req.user.role === 'admin' ? req.body.userId : req.user.id;
        const targetUser = await User.findById(targetUserId);
        
        // Nếu người gửi là khách hàng và bị khóa mõm thì chặn
        if (targetUser && targetUser.isBlocked && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Tài khoản của bạn đã bị chặn chat!" });
        }

        const sender = req.user.role === 'admin' ? 'admin' : 'user';
        
        const newMsg = new Message({ 
            user: targetUserId, 
            sender, 
            text: req.body.text || '',
            attachmentUrl: req.body.attachmentUrl || '',
            attachmentType: req.body.attachmentType || ''
        });
        await newMsg.save();
        res.status(201).json(newMsg);
    } catch (err) { res.status(500).json({ message: "Lỗi gửi tin nhắn" }); }
});

app.get('/api/admin/chat-users', protect, isAdmin, async (req, res) => {
    try {
        const chatUsers = await Message.aggregate([
            { $group: { _id: "$user", lastMessageAt: { $max: "$createdAt" } } },
            { $sort: { lastMessageAt: -1 } }
        ]);
        const populatedUsers = await User.populate(chatUsers, { path: "_id", select: "name email avatar isBlocked" });
        res.json(populatedUsers);
    } catch (err) { res.status(500).json({ message: "Lỗi danh sách chat" }); }
});

app.delete('/api/admin/chat/:userId', protect, isAdmin, async (req, res) => {
    try {
        await Message.deleteMany({ user: req.params.userId });
        res.json({ message: "Đã xóa toàn bộ đoạn chat!" });
    } catch (err) { res.status(500).json({ message: "Lỗi xóa chat" }); }
});

app.put('/api/admin/users/:id/block', protect, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        user.isBlocked = !user.isBlocked; 
        await user.save();
        res.json({ message: user.isBlocked ? "Đã chặn người dùng!" : "Đã mở chặn!", isBlocked: user.isBlocked });
    } catch (err) { res.status(500).json({ message: "Lỗi khóa tài khoản" }); }
});

// ==========================================
// CÁC API SÁCH, DANH MỤC, AUTH, ORDERS BÊN DƯỚI
// ==========================================
app.get('/api/books', async (req, res) => {
    try { res.json(await Book.find()); } 
    catch (err) { res.status(500).json({ message: "Lỗi Server khi lấy danh sách sách" }); }
});

app.get('/api/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });
        res.json(book);
    } catch (err) { res.status(500).json({ message: "Lỗi Server" }); }
});

app.get('/api/categories', async (req, res) => {
    try { res.json(await Category.find()); } 
    catch (err) { res.status(500).json({ message: "Lỗi Server" }); }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "Email này đã được sử dụng!" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "Đăng ký thành công!" });
    } catch (error) { res.status(500).json({ message: "Lỗi đăng ký" }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, rewardPoints: user.rewardPoints || 0 } });
    } catch (error) { res.status(500).json({ message: "Lỗi đăng nhập" }); }
});

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
app.post('/api/auth/google', async (req, res) => {
    try {
        const { credential } = req.body;
        const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
        const { email, name, picture } = ticket.getPayload(); 

        let user = await User.findOne({ email });
        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const randomPassword = await bcrypt.hash(Date.now().toString(), salt);
            user = new User({ name, email, password: randomPassword, avatar: picture });
            await user.save();
        }

        const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, rewardPoints: user.rewardPoints || 0 } });
    } catch (error) { res.status(500).json({ message: "Lỗi Google Auth" }); }
});

app.put('/api/auth/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (req.body.name) user.name = req.body.name;
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }
        if (req.body.avatar !== undefined) user.avatar = req.body.avatar;

        await user.save();
        const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, rewardPoints: user.rewardPoints || 0 }, message: "Cập nhật thành công!" });
    } catch (error) { res.status(500).json({ message: "Lỗi cập nhật hồ sơ" }); }
});

app.post('/api/orders', protect, async (req, res) => {
    try {
        const { fullName, items, totalAmount, pointsUsed } = req.body;
        const user = await User.findById(req.user.id);

        let used = parseInt(pointsUsed) || 0;
        if (used > 0 && user.rewardPoints >= used) {
            user.rewardPoints -= used;
        } else {
            used = 0; 
        }

        const earned = Math.floor(totalAmount / 100000);
        user.rewardPoints = (user.rewardPoints || 0) + earned;
        
        await user.save(); 

        const newOrder = new Order({
            ...req.body, 
            customerName: fullName, 
            user: req.user.id,
            pointsUsed: used,
            pointsEarned: earned,
            status: 'Chờ xác nhận'
        });

        const savedOrder = await newOrder.save();

        if (items) {
            for (const item of items) {
                await Book.findByIdAndUpdate(item._id, { $inc: { stock: -item.quantity } });
            }
        }
        
        const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({ 
            message: "Đặt hàng thành công!", 
            orderId: savedOrder._id,
            earnedPoints: earned,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, rewardPoints: user.rewardPoints }
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server khi đặt hàng" });
    }
});

app.post('/api/admin/categories', protect, isAdmin, async (req, res) => {
    try {
        const newCat = new Category({ name: req.body.name });
        await newCat.save();
        res.status(201).json(newCat);
    } catch (err) { res.status(500).json({ message: "Danh mục này đã tồn tại!" }); }
});

app.delete('/api/admin/categories/:name', protect, isAdmin, async (req, res) => {
    try {
        await Category.findOneAndDelete({ name: req.params.name });
        res.json({ message: "Đã xóa danh mục" });
    } catch (err) { res.status(500).json({ message: "Lỗi xóa danh mục" }); }
});

app.put('/api/admin/categories/rename', protect, isAdmin, async (req, res) => {
    try {
        const { oldName, newName } = req.body;
        await Category.findOneAndUpdate({ name: oldName }, { name: newName }, { upsert: true });
        await Book.updateMany({ categoryName: oldName }, { $set: { categoryName: newName } });
        res.json({ message: "Đổi tên danh mục thành công!" });
    } catch (err) { res.status(500).json({ message: "Lỗi đổi tên danh mục" }); }
});

app.post('/api/admin/books', protect, isAdmin, async (req, res) => {
    try {
        const newBook = new Book(req.body);
        await newBook.save();
        res.status(201).json(newBook);
    } catch (err) { res.status(500).json({ message: "Lỗi thêm sách mới" }); }
});

app.put('/api/admin/books/:id', protect, isAdmin, async (req, res) => {
    try {
        const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedBook);
    } catch (err) { res.status(500).json({ message: "Lỗi cập nhật sách" }); }
});

app.delete('/api/admin/books/:id', protect, isAdmin, async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa sách thành công!" });
    } catch (err) { res.status(500).json({ message: "Lỗi xóa sách" }); }
});

app.get('/api/admin/users', protect, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) { res.status(500).json({ message: "Lỗi lấy danh sách người dùng" }); }
});

app.delete('/api/admin/users/:id', protect, isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa người dùng thành công!" });
    } catch (err) { res.status(500).json({ message: "Lỗi xóa người dùng" }); }
});

app.put('/api/admin/users/:id', protect, isAdmin, async (req, res) => {
    try {
        const { name, role, password } = req.body;
        const user = await User.findById(req.params.id);
        if (name) user.name = name;
        if (role) user.role = role;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        await user.save();
        res.json({ message: "Cập nhật người dùng thành công!" });
    } catch (error) { res.status(500).json({ message: "Lỗi cập nhật người dùng" }); }
});

app.get('/api/admin/orders', protect, isAdmin, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ message: "Lỗi lấy đơn hàng" }); }
});

app.put('/api/admin/orders/:id/status', protect, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(updatedOrder);
    } catch (err) { res.status(500).json({ message: "Lỗi cập nhật trạng thái" }); }
});

app.get('/api/admin/revenue-stats', protect, isAdmin, async (req, res) => {
    try {
        const stats = await Order.aggregate([
            { $match: { status: "Đã hoàn thành" } }, 
            { $group: {
                _id: { $month: "$createdAt" },
                total: { $sum: "$totalAmount" }
            }},
            { $sort: { "_id": 1 } }
        ]);
        res.json(stats);
    } catch (err) { res.status(500).json({ message: "Lỗi thống kê doanh thu" }); }
});

// KHỞI CHẠY SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { 
    console.log(`🚀 Server đang chạy cực mượt tại cổng ${PORT}`); 
});