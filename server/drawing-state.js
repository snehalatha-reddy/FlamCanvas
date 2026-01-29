const history = [];
const redoStack = [];
const MAX_HISTORY = 1000;

// Global background color
let backgroundColor = '#ffffff';

function addAction(action, userId) {
    history.push({
        ...action,
        userId,
        timestamp: Date.now()
    });
    if (history.length > MAX_HISTORY) {
        history.shift();
    }
    // New action clears redo stack
    redoStack.length = 0;
}

function setBackground(color) {
    backgroundColor = color;
}

function undoLastStroke(userId) {
    // Find last action by this user
    const index = history.findLastIndex(action => action.userId === userId);

    if (index !== -1) {
        const undoneAction = history.splice(index, 1)[0];
        redoStack.push(undoneAction);
        return true;
    }
    return false;
}

function redoLastStroke(userId) {
    // Find last undone action by this user
    const index = redoStack.findLastIndex(action => action.userId === userId);

    if (index !== -1) {
        const redoneAction = redoStack.splice(index, 1)[0];
        history.push(redoneAction);
        return true;
    }
    return false;
}

function clearAll() {
    history.length = 0;
    redoStack.length = 0;
}

function getHistory() {
    return { history, background: backgroundColor };
}

module.exports = {
    addAction,
    undo: {
        undoByUser: undoLastStroke,
        redoByUser: redoLastStroke
    },
    clearAll,
    setBackground,
    getHistory
};
