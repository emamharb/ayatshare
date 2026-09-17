
document.addEventListener('contextmenu', function(e) {
e.preventDefault();
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