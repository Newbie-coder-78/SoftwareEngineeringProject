//DOM Elements
const toggleBtn = document.getElementById('theme-toggle');
const html = document.documentElement;
const form = document.getElementById('password-form');
const lengthInput = document.getElementById('length');
const passwordField = document.getElementById('generated-password');
const generateBtn = document.getElementById('generate-btn');
const warning = document.getElementById('warning-msg');
const strengthBar = document.getElementById('strength-btn');
const copyBtn = document.getElementById('copy-btn');

//Disable generate if length < 8 (live check)
lengthInput.addEventListener('input', () => {
    const value = parseInt(lengthInput.value);

    if (value < 8 || isNaN(value)) {
        generateBtn.disabled = true;
        generateBtn.classList.add('disabled');
        warning.textContent = "⚠️ Password must be at least 8 characters."
    } else {
        generateBtn.disabled = false;
        generateBtn.classList.remove('disabled');
        warning.textContent = "";
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const value = parseInt(lengthInput.value);
    if (value < 8 || isNaN(value)) {
        generateBtn.disabled = true;
        generateBtn.classList.add('disabled');
        warning.textContent = "⚠️ Password must be at least 8 characters.";
    }
});

//Theme toggle
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
