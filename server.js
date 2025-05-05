const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const Stripe = require('stripe');
const cookieParser = require('cookie-parser');

const newsletterRoutes = require('./routes/newsletter.routes.js');
const cookieConsentRoutes = require('./routes/cookieConsent.routes.js');
const washerRoutes = require('./routes/washerRoutes.js');
const serviceRequestRoutes = require('./routes/serviceRequest.js');
const contactRoutes = require('./routes/contactRoutes.js');
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/User.js');
const adminRoutes = require('./routes/adminRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes.js');

const { initSocket, getIO } = require('./socket'); // Utilise getIO ensuite si besoin
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
const server = http.createServer(app);

// ✅ Init unique de Socket.io
const io = initSocket(server);

// Middleware Socket.io pour auth si besoin
const jwt = require('jsonwebtoken');
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error("Token invalid or expired"));
    socket.user = decoded;
    next();
  });
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // ton front
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Auth middleware
const authMiddleware = require('./middlewares/authMiddleware.js');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware.protect, userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use("/api", cookieConsentRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/washers', washerRoutes);
app.use('/api/service', serviceRequestRoutes);
app.use('/api', contactRoutes);

// MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((error) => console.log('MongoDB connection error:', error));

// Serveur HTTP avec WebSocket
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
