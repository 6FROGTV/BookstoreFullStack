const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    avatar: { type: String, default: '' }, // Mặc định ai đăng ký cũng là 'user'
    
    // 🔥 BỔ SUNG TRƯỜNG NÀY ĐỂ LƯU ĐIỂM THƯỞNG
    rewardPoints: { type: Number, default: 0 } 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);