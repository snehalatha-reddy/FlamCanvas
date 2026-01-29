const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const drawingState = require('./drawing-state');
const rooms = require('./rooms');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the 'client' directory
app.use(express.static(path.join(__dirname, '../client')));

// Basic route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Socket.io connection handling
io.on('connection', (socket) => {
    // Get username from query parameters of handshake
    const username = socket.handshake.query.username || 'Anonymous';

    // Assign user
    const user = rooms.addUser(socket.id, username);
    console.log(`User connected: ${username} (${socket.id})`);

    // Broadcast user count update
    io.emit('user_count', io.engine.clientsCount);

    // Send global history to new user
    socket.emit('history_update', drawingState.getHistory());
    // Send own info
    socket.emit('current_user', { id: socket.id, color: user.color, username: user.username });

    socket.on('draw_live', (data) => {
        // Broadcast to all other clients
        socket.broadcast.emit('draw_live', data);
    });

    socket.on('save_action', (data) => {
        // Add to global history
        drawingState.addAction(data, socket.id);
        // Broadcast confirmation to others
        socket.broadcast.emit('action_committed', { ...data, userId: socket.id });
    });

    socket.on('change_background', (color) => {
        drawingState.setBackground(color);
        io.emit('background_update', color);
    });

    socket.on('undo', () => {
        const changed = drawingState.undo.undoByUser(socket.id);
        if (changed) {
            io.emit('history_update', drawingState.getHistory());
        }
    });

    socket.on('redo', () => {
        const changed = drawingState.undo.redoByUser(socket.id);
        if (changed) {
            io.emit('history_update', drawingState.getHistory());
        }
    });

    socket.on('clear', () => {
        drawingState.clearAll();
        io.emit('history_update', drawingState.getHistory());
    });

    socket.on('cursor_move', (data) => {
        // Update server state for this user
        rooms.updateUserCursor(socket.id, data.x, data.y);
        const currentUser = rooms.getUser(socket.id);

        // Broadcast cursor position with COLOR and USERNAME
        socket.broadcast.emit('cursor_move', {
            x: data.x,
            y: data.y,
            userId: socket.id,
            color: currentUser ? currentUser.color : '#000',
            username: currentUser ? currentUser.username : '???'
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        rooms.removeUser(socket.id);

        io.emit('user_disconnected', socket.id);
        io.emit('user_count', io.engine.clientsCount);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
