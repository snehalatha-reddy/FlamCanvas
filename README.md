# Real-Time Collaborative Drawing Canvas

A multi-user drawing application where multiple people can draw simultaneously on a shared canvas.

## Technical Stack
*   **Frontend**: Vanilla JavaScript (ES6+), HTML5 Canvas API. No external drawing libraries.
*   **Backend**: Node.js, Express.
*   **Communication**: Socket.io (WebSocket).

## Features
### Core Requirements
*   **Drawing Tools**: Brush with adjustable size (slider) and colors (picker).
*   **Eraser Tool**: Dedicated eraser with size adjustment.
*   **Real-time Sync**: Bi-directional broadcasting of drawing strokes.
*   **User Indicators**: "Ghost Cursors" showing other users' positions in real-time.
*   **Global Undo/Redo**: Synchronized history stack managed by the server.
*   **Conflict Resolution**: Handled via sequential server-side history and optimistic UI.
*   **User Management**: Randomly assigned colors and persistent connection tracking.

### Bonus Features
*   **Mobile Touch Support**: Full touch event handling for mobile devices.
*   **Room Architecture**: Modular `server/rooms.js` structure ready for multi-room scaling.
*   **Modern UI**: Floating tool dock, smooth transitions, and responsive design.

## Project Structure
*   `client/`
    *   `canvas.js`: Core drawing logic (Canvas API).
    *   `websocket.js`: Socket.io event handling.
    *   `main.js`: App initialization entry point.
*   `server/`
    *   `server.js`: Express & Socket.io entry.
    *   `rooms.js`: User connection management.
    *   `state-manager.js`: History stack logic.

## Setup Instructions

1.  **Prerequisites**: Node.js (v18+) installed.
2.  **Install Dependencies**:
    ```bash
    cd collaborative-canvas
    npm install
    ```
3.  **Run the Server**:
    ```bash
    npm start
    # Or for development:
    npx nodemon server/server.js
    ```
4.  **Access the App**:
    *   Open `http://localhost:3000` in your browser.
    *   Open a second tab/window to test collaboration.

## Testing with Multiple Users

1.  Open `http://localhost:3000` in Browser Window A.
2.  Open `http://localhost:3000` in Browser Window B (incognito or different browser).
3.  Draw in Window A -> Window B should update instantly.
4.  Move mouse in Window A -> Red cursor should appear in Window B.
5.  Click "Undo" in Window A -> The last stroke by User A should vanish from both windows.

## Time Spent

Approx. 2 hours.

## Known Limitations

*   **High Frequency Events**: On very slow networks, cursor updates might lag.
*   **History Limit**: Currently limited to 1000 strokes (in-memory).
*   **Mobile Support**: Basic touch support via mouse events (might need specific touch listeners for full mobile support).
