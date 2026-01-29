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

// Local cache for redraw on resize
let localHistory = [];

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
        // Cache temp image (optional) or just redraw
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Redraw immediately
        window.redrawCanvas(localHistory, backgroundColor);
    });
}
//...
// existing functions...
//...
window.redrawCanvas = function (history, bgColor) {
    if (history) {
        localHistory = history;
    }

    if (bgColor) {
        backgroundColor = bgColor;
        canvas.style.backgroundColor = bgColor;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (localHistory && Array.isArray(localHistory)) {
        localHistory.forEach(item => {
            if (item.type === 'stroke' && item.segments) {
                item.segments.forEach(seg => {
                    drawLine(seg.x0, seg.y0, seg.x1, seg.y1, seg.color, seg.width, false, seg.isEraser);
                });
            }
        });
    }
};

window.initCanvas = initCanvas;
