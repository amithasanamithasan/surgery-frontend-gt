const GlobalFunction = {
    logout() {
        localStorage.removeItem('id');
        localStorage.removeItem('email');
        localStorage.removeItem('username');
        localStorage.removeItem('name');
        localStorage.removeItem('role');
        localStorage.removeItem('user_status');
        localStorage.removeItem('token');
        window.location.href = '/';
    },
    
    resetTimeout() {
        clearTimeout(window.inactivityTimeout);
        window.inactivityTimeout = setTimeout(this.logout, 60* 60 * 1000); // 60 minutes
    }
};

// Event listeners for user activity
document.addEventListener('mousemove', () => GlobalFunction.resetTimeout());
document.addEventListener('keydown', () => GlobalFunction.resetTimeout());
GlobalFunction.resetTimeout();

export default GlobalFunction;
