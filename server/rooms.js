// Logic for tracking users in the global canvas
const users = {}; // socket.id -> { username, color, x, y }

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function addUser(socketId, username) {
    users[socketId] = {
        username: username || 'Anonymous',
        color: getRandomColor()
    };
    return users[socketId];
}

function removeUser(socketId) {
    const user = users[socketId];
    delete users[socketId];
    return user;
}

function updateUserCursor(socketId, x, y) {
    if (users[socketId]) {
        users[socketId].x = x;
        users[socketId].y = y;
    }
    return users[socketId];
}

function getUser(socketId) {
    return users[socketId];
}

module.exports = {
    addUser,
    removeUser,
    updateUserCursor,
    getUser
};
