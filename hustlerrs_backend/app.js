const reviewRoutes = require('./routes/reviews');
const { initializeSocket } = require('./socket');

// Routes
app.use('/api/reviews', reviewRoutes);

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.io
initializeSocket(server); 