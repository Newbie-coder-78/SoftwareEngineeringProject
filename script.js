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

//Character sets
const charSets = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+~`|}{[]\\:;?><,./-="
};

//Generate Password
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const length = parseInt(document.getElementById('length').value);
    const includeUpper = document.getElementById('uppercase').checked;
    const includeLower = document.getElementById('lowercase').checked;
    const includeNumbers = document.getElementById('numbers').checked;
    const includeSymbols = document.getElementById('symbols').checked;

    let validChars = '';
    if (includeUpper) validChars += charSets.uppercase;
    if (includeLower) validChars += charSets.lowercase;
    if (includeNumbers) validChars += charSets.numbers;
    if (includeSymbols) validChars += charSets.symbols;

    if (!validChars) {
        passwordField.value = '';
        strengthBar.style.backgroundColor = "var(--border-color)";
        warning.textContent = "❌ Select at least one character type.";
        return;
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * validChars.length);
        password += validChars[randomIndex];
    }

    passwordField.value = password;
    warning.textContent = "";
    evaluateStrength(password);
});
