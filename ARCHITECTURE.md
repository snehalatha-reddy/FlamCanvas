# Architecture Documentation

## Data Flow Diagram

1.  **User Action**: User draws on canvas (mousedown -> mousemove -> mouseup).
2.  **Local Rendering**: `canvas.js` draws the line segments immediately on the local canvas (`ctx.lineTo`, `ctx.stroke`) for zero-latency feedback.
3.  **Real-Time Broadcast**:
    *   During `mousemove`, `canvas.js` emits `draw_live` events via Socket.io containing segment data `{x0, y0, x1, y1, color, width}`.
    *   **Server**: Receives `draw_live` and broadcasts it to all *other* connected clients.
    *   **Remote Clients**: Receive `draw_live`, and `canvas.js` draws the segment transiently.
4.  **Stroke Persistence**:
    *   On `mouseup`, `canvas.js` emits `save_stroke` with the full array of segments for that stroke.
    *   **Server**: Adds the stroke object to the `history` stack in `state-manager.js`.
    *   **Server**: Broadcasts `stroke_committed` (optional confirmation) or simply stores it.
5.  **New User Join**:
    *   On connection, Server sends `history_update` with the full `history` array.
    *   Client `redrawCanvas()` clears the canvas and replays all strokes.
6.  **Global Undo**:
    *   User clicks "Undo". Client emits `undo`.
    *   **Server**: Finds the last stroke by that user and removes it from `history`.
    *   **Server**: Broadcasts `history_update` with the *new* history.
    *   **All Clients**: `redrawCanvas()` clears and replays the new history (effectively removing the undone stroke).

## WebSocket Protocol

### Client -> Server

*   `draw_live`: `{ x0, y0, x1, y1, color, width }` - Transient drawing segment.
*   `save_action`: `{ type: 'stroke', segments: [...] }` OR `{ type: 'text', text, x, y, color, font }` - Persistent action.
*   `change_background`: `color` - Hex color string.
*   `undo`: `{}` - Request to undo last action.
*   `cursor_move`: `{ x, y, color }` - Cursor position and user color.

### Server -> Client

*   `draw_live`: `{ x0, y0, x1, y1, color, width }` - Forwarded segment.
*   `history_update`: `{ history: [...], background: '...' }` - Full state refresh.
*   `background_update`: `color` - Background change broadcast.
*   `cursor_move`: `{ x, y, userId, color }` - Other user's cursor.
*   `user_count`: `Number` - Total connected users.
*   `user_disconnected`: `details` - ID of disconnected user.

## Undo/Redo Strategy

We implemented a **Global History with User-Specific Undo**.
*   **Storage**: The server maintains a linear `history` array of stroke objects.
*   **Undo Logic**: When a user triggers "Undo", the server searches the history stack from the end for the last stroke associated with that user's ID (`socket.id`).
*   **Synchronization**: Since undoing an action changes the past, we cannot simply "erase" a line (cascading overlaps). We must **clear and redraw**. The server sends the updated history to ALL clients, and every client clears their canvas and iterates through the history to draw every stroke again. This ensures eventual consistency.

## Performance Decisions

*   **Segment Broadcasting**: We emit small `draw_live` segments rather than full paths during drawing to minimize payload size and latency.
*   **Transient vs Persistent**: Live drawing is ephemeral. Persistence is handled by `save_stroke`. This decoupling allows for "optimistic UI" (local draw is instant) while ensuring data integrity on the server.
*   **Canvas Repaint**: We accept the cost of full canvas clears on Undo/History updates. For a prototype/assignment scope, this is acceptable. For production with thousands of strokes, we would implement off-screen canvas caching (layering) or quad-tree spatial indexing to only redraw affected regions.
*   **Binary Data**: Currently using JSON. For higher performance, we could switch to binary buffers (ArrayBuffer) for coordinates.

## Technical Challenges & Solutions

### 1. Canvas Mastery
*   **Path Optimization**: We use `lineCap: 'round'` and `lineJoin: 'round'` for smooth strokes. To prevent jagged lines during fast movement, we rely on the browser's native `mousemove` sampling rate, which is generally sufficient. For higher precision, we could implement Catmull-Rom splines interpolation.
*   **Efficient Redrawing**: The `redrawCanvas` function is optimized to clear and batch-replay the history. By broadcasting small segments (`draw_live`) instead of full paths during interaction, we keep the UI responsive.

### 2. Real-time Architecture
*   **Event Streaming**: Drawing data is serialized as lightweight JSON objects `{x0, y0, x1, y1, color, width}`.
*   **Latency Handling**: We use "Optimistic UI" updates—the local user sees their stroke immediately (0 latency), while the network event is sent in parallel.
*   **Batching**: Currently, we emit per-segment. For scale, we would implement a `throttle` (implemented in `canvas.js` at 10ms) to bundle segments.

### 3. State Synchronization
*   **Global Undo/Redo**: We maintain a single source of truth (the Server). The `history` stack is linear.
*   **Conflict Resolution**:
    *   **Simultaneous Drawing**: Canvas context naturally handles overlapping pixels (last write wins visually).
    *   **Undo Conflicts**: If User A undoes while User B draws, the canvas refresh might momentarily wipe User B's *transient* stroke. Ideally, the client would re-render the current in-progress stroke after a history refresh (`isDrawing` check).


