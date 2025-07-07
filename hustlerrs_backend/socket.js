const socketIo = require('socket.io');
let io;

const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected');

        socket.on('joinUserRoom', ({ userId }) => {
            if (userId) {
                socket.join(`user_${userId}`);
                console.log(`User joined personal room: user_${userId}`);
            }
        });

        socket.on('joinJobRoom', ({ jobId }) => {
            if (jobId) {
                socket.join(`job_${jobId}`);
                console.log(`User joined room: job_${jobId}`);
            }
        });

        socket.on('sendMessage', (message) => {
            if (message && message.jobId) {
                io.to(`job_${message.jobId}`).emit('newMessage', message);
            }
        });

        socket.on('jobCompleted', ({ jobId, reviewerName, hustlerId }) => {
            if (jobId) {
                io.to(`job_${jobId}`).emit('jobReviewed', {
                    jobId,
                    reviewerName
                });
                
                if (hustlerId) {
                    io.to(`user_${hustlerId}`).emit('jobReviewed', {
                        jobId,
                        reviewerName
                    });
                }
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = {
    initializeSocket,
    getIo
}; 