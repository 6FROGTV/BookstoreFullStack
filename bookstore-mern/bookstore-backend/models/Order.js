const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: String, // Thêm trường này
    phone: String,        // Thêm trường này
    address: String,      // Thêm trường này
    paymentMethod: String, 
    note: String,
    items: Array, 
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'Chờ xác nhận' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);