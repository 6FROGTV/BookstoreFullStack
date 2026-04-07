const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    discount: { type: Number, default: 0 }, // % Giảm giá mới thêm
    imageUrl: { type: String },
    categoryName: { type: String, required: true },
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);