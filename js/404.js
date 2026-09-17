document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        document.querySelector('.error-container').style.opacity = '1';
        document.querySelector('.error-container').style.transform = 'translateY(0)';
    }, 100);
    
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    
    document.querySelector('.back-btn').addEventListener('click', function() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'index.html';
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.keyCode === 123) {
            e.preventDefault();
        }
        if (e.ctrlKey && e.key.toLowerCase() === 'u') {
            e.preventDefault();
        }
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') {
            e.preventDefault();
        }
    });
});