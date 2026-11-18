const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Replace YOUR_ACTUAL_PASSWORD_HERE with your MongoDB database user password (do not keep < > brackets)
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://lewane461_db_user:lewane698@cluster0.kmc61ml.mongodb.net/mimi_boutique?retryWrites=true&w=majority";

// Middleware
app.use(cors());
// Allows up to 10MB so suit photos from admin.html upload cleanly
app.use(express.json({ limit: '10mb' }));
// Serves your HTML, CSS, JS, and image files directly
app.use(express.static(__dirname));

// Connect to MongoDB Atlas
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB Cloud Database (mimi_boutique)'))
    .catch(err => console.error('MongoDB Connection Error:', err.message));

// ==========================================
// DATABASE SCHEMAS (PRODUCTS & ORDERS)
// ==========================================
const productSchema = new mongoose.Schema({
    id: String,
    title: String,
    price: String,
    sizes: String,
    category: String,
    badge: String,
    mainImg: String,
    details: [String],
    createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
    orderId: String,
    date: String,
    customerName: String,
    phone: String,
    address: String,
    deliveryZone: String,
    paymentMethod: String,
    senderName: String,
    transactionId: String,
    items: Array,
    totalAmount: String,
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

// ==========================================
// 1. PRODUCT API ROUTES (Storefront & Admin)
// ==========================================
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ success: true, product: newProduct });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save product' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.deleteOne({ id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// ==========================================
// 2. ORDER API ROUTES (Checkout & Admin)
// ==========================================
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ success: true, order: newOrder });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save order' });
    }
});

app.put('/api/orders/:orderId', async (req, res) => {
    try {
        const updatedOrder = await Order.findOneAndUpdate(
            { orderId: req.params.orderId },
            { status: req.body.status },
            { new: true }
        );
        res.json({ success: true, order: updatedOrder });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

app.delete('/api/orders/:orderId', async (req, res) => {
    try {
        await Order.deleteOne({ orderId: req.params.orderId });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

// ==========================================
// 3. DEFAULT HOMEPAGE ROUTE & START SERVER
// ==========================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'MIMI BY MARYAM.html'));
});

app.listen(PORT, () => {
    console.log(`Mimi by Maryam Live Server running at http://localhost:${PORT}`);
    console.log(`Admin Panel: http://localhost:${PORT}/admin.html`);
});
