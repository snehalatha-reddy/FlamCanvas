document.addEventListener('DOMContentLoaded', () => {

    const loginModal = document.getElementById('loginModal');
    const usernameInput = document.getElementById('usernameInput');
    const joinBtn = document.getElementById('joinBtn');
    const app = document.getElementById('app');

    function joinApp() {
        const username = usernameInput.value.trim();
        if (username.length > 0) {
            // Hide Modal
            loginModal.style.display = 'none';
            // Show App
            app.classList.remove('hidden');

            // Initialize App
            if (window.initCanvas) {
                window.initCanvas();
            }
            if (window.initWebsocket) {
                window.initWebsocket(username);
            }
        } else {
            alert('Please enter your name!');
        }
    }

    joinBtn.addEventListener('click', joinApp);

    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            joinApp();
        }
    });

    // FPS Counter removed as per simplification
});
