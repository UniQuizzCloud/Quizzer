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

    socket.on('typing', ({ room, user }) => {
        if (rooms[room] && rooms[room].users[socket.id]) {
            const userColor = rooms[room].users[socket.id].color;
            socket.broadcast.to(room).emit('user typing', { user, color: userColor });
        }
    });

    socket.on('stop typing', ({ room, user }) => {
        socket.broadcast.to(room).emit('user stop typing', { user });
    });

    socket.on('join room', ({ room, user, id, preserveMessages }) => {
        if (!rooms[room]) {
            rooms[room] = { users: {}, messages: [], userCount: 0, preserveMessages };
        }

        rooms[room].users[socket.id] = { name: user, color: getRandomColor(), id };
        rooms[room].userCount++;

        socketRoomMap[socket.id] = room;  // Map socket ID to room name
        socketUserMap[socket.id] = { name: user, id };  // Map socket ID to user info

        socket.join(room);
        socket.emit('load messages', rooms[room].messages);
        io.to(room).emit('system message', `${user} joined the chat`);
        console.log(`Room Code is ${room}`);
    });

    socket.on('chat message', ({ room, msg, user, id }) => {
        if (rooms[room]) {
            const messageData = { msg, user: rooms[room].users[socket.id].name, color: rooms[room].users[socket.id].color, id };
            rooms[room].messages.push(messageData);
            io.to(room).emit('chat message', messageData);
        }
    });

    socket.on('disconnect', () => {
        const room = socketRoomMap[socket.id];
        if (room && rooms[room]) {
            const userInfo = rooms[room].users[socket.id];
            if (--rooms[room].userCount === 0 && !rooms[room].preserveMessages) {
                delete rooms[room];
            } else if (userInfo) {
                io.to(room).emit('system message', `${userInfo.name} left the chat`);
            }
            delete rooms[room]?.users[socket.id];
        }

        delete socketRoomMap[socket.id];  // Remove mapping on disconnect
        delete socketUserMap[socket.id];  // Remove user mapping on disconnect
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
