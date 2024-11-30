const express = require('express');
const socketIo = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', socket => {
    console.log('User connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    // Offer va answer uchun signalizatsiya
    socket.on('offer', offer => {
        socket.broadcast.emit('offer', offer);
    });
    socket.on('answer', answer => {
        socket.broadcast.emit('answer', answer);
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
