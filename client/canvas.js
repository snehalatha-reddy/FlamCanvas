const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const brushSize = document.getElementById('brushSize');
const colorPicker = document.getElementById('colorPicker');

// Set canvas size to window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentStroke = [];

let currentTool = 'brush'; // 'brush' or 'eraser'
let backgroundColor = '#ffffff';

function initCanvas() {
    // Event Listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch Support
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchend', () => {
        const mouseEvent = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(mouseEvent);
    });

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

function getCanvasCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function startDrawing(e) {
    isDrawing = true;
    const coords = getCanvasCoordinates(e);
    lastX = coords.x;
    lastY = coords.y;
}

function drawLine(x0, y0, x1, y1, color, width, emit, isEraser) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = isEraser ? backgroundColor : color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.closePath();

    if (!emit) return;

    const segment = {
        x0: x0,
        y0: y0,
        x1: x1,
        y1: y1,
        color: color,
        width: width,
        isEraser: isEraser
    };

    currentStroke.push(segment);

    // Throttle emitting for performance
    throttleEmit(segment);
}

// Throttling helper
let throttleTimer;
function throttleEmit(data) {
    if (window.emitDraw) {
        window.emitDraw(data);
    }
}

function draw(e) {
    if (!isDrawing) return;
    const coords = getCanvasCoordinates(e);

    drawLine(lastX, lastY, coords.x, coords.y, colorPicker.value, brushSize.value, true, currentTool === 'eraser');
    lastX = coords.x;
    lastY = coords.y;
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;

        if (currentStroke.length > 0 && typeof emitSaveStroke === 'function') {
            emitSaveStroke(currentStroke);
        }
        currentStroke = [];
    }
}

// Listen for tool changes
window.setAppTool = function (tool) {
    currentTool = tool;
};

// Expose for remote drawing and history
window.drawRemoteLine = function (data) {
    drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.width, false, data.isEraser);
};

window.redrawCanvas = function (history, bgColor) {
    if (bgColor) {
        backgroundColor = bgColor;
        canvas.style.backgroundColor = bgColor;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (history && Array.isArray(history)) {
        history.forEach(item => {
            if (item.type === 'stroke' && item.segments) {
                item.segments.forEach(seg => {
                    drawLine(seg.x0, seg.y0, seg.x1, seg.y1, seg.color, seg.width, false, seg.isEraser);
                });
            }
        });
    }
};

window.initCanvas = initCanvas;
