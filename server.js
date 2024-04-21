const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const rooms = {};  // Stores room details including user count and messages
const socketRoomMap = {};  // Maps socket IDs to room names
const socketUserMap = {};  // Maps socket IDs to user information

app.use(express.static('public'));

io.on('connection', (socket) => {
    // Existing join room and chat message handling...

    socket.on('typing', ({ room, user }) => {
        const userColor = rooms[room].users[socketUserMap[socket.id].id].color;
        socket.broadcast.to(room).emit('user typing', { user, color: userColor });
    });

    socket.on('stop typing', ({ room, user }) => {
        socket.broadcast.to(room).emit('user stop typing', { user });
    });


    socket.on('join room', ({ room, user, id }) => {
        if (!rooms[room]) {
            rooms[room] = { users: {}, messages: [], userCount: 0 };
        }

        rooms[room].users[id] = { name: user, color: getRandomColor() };
        rooms[room].userCount++;  // Increment user count

        socketRoomMap[socket.id] = room;
        socketUserMap[socket.id] = { user: user, id: id };

        socket.join(room);
        socket.emit('load messages', rooms[room].messages);
        io.to(room).emit('system message', `${user} joined the chat`);
        socket.emit('system message', `Your room code is ${room}`);

    });

    socket.on('chat message', ({ room, msg, user, id }) => {
        if (rooms[room]) {
            const messageData = { msg, user: rooms[room].users[id].name, color: rooms[room].users[id].color, id };
            rooms[room].messages.push(messageData);
            io.to(room).emit('chat message', messageData);
        }
    });

    socket.on('disconnect', () => {
        const room = socketRoomMap[socket.id];
        const userInfo = socketUserMap[socket.id];

        if (room && userInfo) {
            // Decrease the user count immediately upon disconnection
            if (--rooms[room].userCount === 0) {
                // If no users are left, clear messages
                rooms[room].messages = [];
            } else {
                io.to(room).emit('system message', `${userInfo.user} left the chat`);
            }

            delete rooms[room].users[userInfo.id];
            delete socketRoomMap[socket.id];
            delete socketUserMap[socket.id];
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 60%)`;
}
