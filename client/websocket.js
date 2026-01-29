function initWebsocket(username) {
    // Connect with username in query options
    const socket = io({
        query: { username: username }
    });

    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const clearBtn = document.getElementById('clearBtn');
    const brushBtn = document.getElementById('tool-brush');
    const eraserBtn = document.getElementById('tool-eraser');
    const bgColorPicker = document.getElementById('bgColorPicker');

    // UI Switching
    if (brushBtn) {
        brushBtn.addEventListener('click', () => {
            if (window.setAppTool) window.setAppTool('brush');
            brushBtn.classList.add('active');
            if (eraserBtn) eraserBtn.classList.remove('active');
        });
    }

    if (eraserBtn) {
        eraserBtn.addEventListener('click', () => {
            if (window.setAppTool) window.setAppTool('eraser');
            eraserBtn.classList.add('active');
            if (brushBtn) brushBtn.classList.remove('active');
        });
    }

    if (bgColorPicker) {
        bgColorPicker.addEventListener('change', (e) => {
            socket.emit('change_background', e.target.value);
        });
    }

    // EXPOSED HELPER FUNCTIONS for canvas.js
    window.emitDraw = function (data) {
        socket.emit('draw_live', data);
    };

    window.emitSaveStroke = function (strokeSegments) {
        // Send stroke to server
        socket.emit('save_action', {
            type: 'stroke',
            segments: strokeSegments
        });
    };

    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            socket.emit('undo');
        });
    }

    if (redoBtn) {
        redoBtn.addEventListener('click', () => {
            socket.emit('redo');
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Clear canvas for everyone?')) {
                socket.emit('clear');
            }
        });
    }

    // --- INCOMING EVENTS ---

    socket.on('current_user', (user) => {
        // Set Avatar
        const avatar = document.getElementById('userAvatar');
        if (avatar) {
            // Get first char, safe check
            const initial = (user.username || '?').charAt(0).toUpperCase();
            avatar.innerText = initial;
            avatar.style.backgroundColor = user.color;
        }
    });

    // 1. Live Drawing
    socket.on('draw_live', (data) => {
        if (window.drawRemoteLine) {
            window.drawRemoteLine(data);
        }
    });

    // 2. History Sync
    socket.on('history_update', (data) => {
        const history = data.history || data;
        const background = data.background || null;

        if (window.redrawCanvas) {
            window.redrawCanvas(history, background);
        }

        if (background && bgColorPicker && bgColorPicker.value !== background) {
            bgColorPicker.value = background;
        }
    });

    socket.on('background_update', (color) => {
        const canvas = document.getElementById('drawingCanvas');
        if (canvas) canvas.style.backgroundColor = color;
        if (bgColorPicker) bgColorPicker.value = color;
    });

    // 3. Cursors with Usernames
    document.addEventListener('mousemove', (e) => {
        socket.emit('cursor_move', { x: e.clientX, y: e.clientY });
    });

    const cursors = {}; // userId -> element

    socket.on('cursor_move', (data) => {
        const { userId, x, y, color, username } = data;

        if (!cursors[userId]) {
            const cursorContainer = document.createElement('div');
            cursorContainer.className = 'cursor-container';
            cursorContainer.style.position = 'absolute';
            cursorContainer.style.pointerEvents = 'none';
            cursorContainer.style.zIndex = '1000';
            cursorContainer.style.transition = 'top 0.1s, left 0.1s';

            // Dot with Initial
            const dot = document.createElement('div');
            dot.style.width = '24px';
            dot.style.height = '24px';
            dot.style.borderRadius = '50%';
            dot.style.backgroundColor = color || 'red';
            dot.style.display = 'flex';
            dot.style.alignItems = 'center';
            dot.style.justifyContent = 'center';
            dot.style.color = 'white';
            dot.style.fontWeight = 'bold';
            dot.style.fontSize = '12px';
            dot.innerText = (username || '?').charAt(0).toUpperCase();
            dot.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

            // Label
            const label = document.createElement('div');
            label.innerText = username || 'Anon';
            label.style.position = 'absolute';
            label.style.top = '26px';
            label.style.left = '50%';
            label.style.transform = 'translateX(-50%)';
            label.style.backgroundColor = 'rgba(0,0,0,0.6)';
            label.style.color = 'white';
            label.style.padding = '2px 6px';
            label.style.borderRadius = '4px';
            label.style.fontSize = '10px';
            label.style.whiteSpace = 'nowrap';

            cursorContainer.appendChild(dot);
            cursorContainer.appendChild(label);
            document.body.appendChild(cursorContainer);
            cursors[userId] = cursorContainer;
        }

        const cursor = cursors[userId];
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
    });

    socket.on('user_disconnected', (userId) => {
        if (cursors[userId]) {
            cursors[userId].remove();
            delete cursors[userId];
        }
    });

    const userCountSpan = document.getElementById('userCount');
    socket.on('user_count', (count) => {
        if (userCountSpan) userCountSpan.innerText = count + ' Online';
    });

    console.log(`WebSocket initialized for ${username}`);
}

window.initWebsocket = initWebsocket;
