const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');
const fs = require('fs');
const Sentry = require('@sentry/node');

dotenv.config();
const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

Sentry.init({
    dsn: 'https://8b450fe24119a6a13ccb7519069d2c28@o4509553810997248.ingest.us.sentry.io/4509553953538048',
    integrations: [
        Sentry.httpIntegration({ tracing: true }),
        Sentry.expressIntegration(),
    ],
    tracesSampleRate: 1.0,
});

const uploadsDir = path.join(__dirname, 'uploads');
const profilePicsDir = path.join(uploadsDir, 'profile-pictures');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(profilePicsDir)) {
    fs.mkdirSync(profilePicsDir);
}

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const bidRoutes = require('./routes/bidRoutes');
const profileRoutes = require('./routes/profileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const users = require('./routes/users');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const hustlerApplicationRoutes = require('./routes/hustlerApplicationRoutes');
const utilsRoutes = require('./routes/utilsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', users);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hustler-applications', hustlerApplicationRoutes);
app.use('/api/utils', utilsRoutes);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  socket.on('joinJobRoom', ({ jobId }) => {
    socket.join(`job_${jobId}`);
  });

  socket.on('sendMessage', (data) => {
    io.to(`job_${data.jobId}`).emit('newMessage', data);
  });

  socket.on('jobCompleted', ({ jobId, reviewerName, hustlerId }) => {
    // Emit to the specific job room
    io.to(`job_${jobId}`).emit('jobReviewed', {
      jobId,
      reviewerName
    });
    
    // Also emit to hustler's personal room
    io.to(`user_${hustlerId}`).emit('jobReviewed', {
      jobId,
      reviewerName
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.get('/', (req, res) => {
  res.send('HUSTLERRS API is running 😎');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

Sentry.setupExpressErrorHandler(app);

app.use(function onError(err, req, res, next) {
    res.statusCode = 500;
    res.end(res.sentry + "\n");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 