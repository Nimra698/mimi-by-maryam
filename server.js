const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Reads your MongoDB link safely from Render Environment Variables
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// Connect to MongoDB Atlas
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB Cloud Database (mimi_boutique)'))
    .catch(err => console.error('MongoDB Connection Error:', err.message));

// ==========================================
// BREVO HTTPS EMAIL SENDER (WORKS ON RENDER)
// ==========================================
async function sendOrderConfirmationEmail(order) {
    if (!order.email || !process.env.BREVO_API_KEY || !process.env.GMAIL_USER) {
        console.log('Skipping email: Missing customer email, BREVO_API_KEY, or GMAIL_USER env vars.');
        return;
    }

    const itemsHtml = (order.items || []).map(item => `
        <tr>
            <td style="padding: 10px 8px; border-bottom: 1px solid #eae6e1;">${item.title} (${item.size})</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #eae6e1; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #eae6e1; text-align: right;">${item.price}</td>
        </tr>
    `).join('');

    const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eae6e1; padding: 28px; background-color: #ffffff; color: #1a1715;">
            <h2 style="text-align: center; letter-spacing: 2px; margin-bottom: 4px;">MIMI BY MARYAM</h2>
            <p style="text-align: center; color: #888888; font-size: 12px; margin-top: 0;">Timeless Luxury For Little Princesses</p>
            <hr style="border: none; border-top: 1px solid #eae6e1; margin: 20px 0;">

            <h3 style="margin-bottom: 8px;">Thank you for your order, ${order.customerName}!</h3>
            <p style="font-size: 14px; color: #444444; line-height: 1.5;">
                We have received your order <strong>#${order.orderId}</strong> and our boutique team is preparing your outfit with care.
            </p>

            <table style="width: 100%; border-collapse: collapse; margin: 22px 0; font-size: 13px;">
                <thead>
                    <tr style="background-color: #faf8f5;">
                        <th style="padding: 10px 8px; text-align: left; border-bottom: 1px solid #eae6e1;">Outfit</th>
                        <th style="padding: 10px 8px; text-align: center; border-bottom: 1px solid #eae6e1;">Qty</th>
                        <th style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #eae6e1;">Price</th>
                    </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>

            <p style="font-size: 16px; font-weight: bold; text-align: right; margin-bottom: 20px;">
                Total Payable: ${order.totalAmount}
            </p>

            <div style="background-color: #faf8f5; padding: 14px; border: 1px solid #eae6e1; font-size: 13px; line-height: 1.6;">
                <strong>Delivery & Payment Details:</strong><br>
                • <strong>Payment Method:</strong> ${order.paymentMethod}<br>
                • <strong>Phone:</strong> ${order.phone}<br>
                • <strong>Shipping Address:</strong> ${order.address}
            </div>

            <p style="font-size: 12px; color: #777777; margin-top: 24px; text-align: center;">
                Need assistance or tracking updates? WhatsApp us anytime at <strong>+92 310 0064795</strong>.
            </p>
        </div>
    `;

    try {
        const brevoEndpoint = ['https:/', '://brevo.com', 'v3', 'smtp', 'email'].join('/');
        const res = await fetch(brevoEndpoint, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: 'MIMI BY MARYAM', email: process.env.GMAIL_USER },
                to: [{ email: order.email, name: order.customerName }],
                bcc: [{ email: process.env.GMAIL_USER }],
                subject: `Order Confirmed #${order.orderId} | MIMI BY MARYAM`,
                htmlContent: htmlBody
            })
        });
        const data = await res.json();
        console.log('Brevo Email Response:', res.status, data);
    } catch (err) {
        console.error('Failed to send Brevo order email:', err.message);
    }
}

// ==========================================
// DATABASE SCHEMAS (PRODUCTS & ORDERS)
// ==========================================
const productSchema = new mongoose.Schema({
    id: String,
    title: String,
    price: String,
    priceSmall: String,
    priceLarge: String,
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
    email: String,
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
        // 1. Send automatic confirmation email via Brevo HTTPS API
        await sendOrderConfirmationEmail(req.body);

        // 2. Save order to MongoDB
        const newOrder = new Order(req.body);
        await newOrder.save();

        res.status(201).json({ success: true, order: newOrder });
    } catch (err) {
        console.error('Order API Error:', err.message);
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
