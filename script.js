//Theme toggle logic
const toggleBtn = document.getElementById('theme-toggle');
const html = document.documentElement;

function updateToggleText(theme) {
    const oppositeTheme = theme === 'light' ? 'Dark' : 'Light';
    toggleBtn.textContent = `Switch to ${oppositeTheme} Mode`;
}

toggleBtn.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateToggleText(newTheme);
});

//Apply saved theme on load
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateToggleText(savedTheme);
});
