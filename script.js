window.addEventListener('DOMContentLoaded', async () => {
    //Initialize session
    try {
        const res = await fetch('/api/init-session', { method: 'POST' });
        if (!res.ok) {
            throw new Error('Failed to initialize session');
        }
        await checkSessionStatus();
    } catch (err) {
        console.error('Session initialization error:', err);
    }

    //DOM Elements
    const html = document.documentElement;
    const toggleBtn = document.getElementById('theme-toggle');
    const form = document.getElementById('password-form');
    const lengthInput = document.getElementById('length');
    const passwordField = document.getElementById('generated-password');
    const generateBtn = document.getElementById('generate-btn');
    const warning = document.getElementById('warning-msg');
    const strengthBar = document.getElementById('strength-btn');
    const copyBtn = document.getElementById('copy-btn');

    //Modal logic
    const authToggle = document.getElementById('auth-toggle');
    const authModal = document.getElementById('auth-modal');
    const closeModal = document.getElementById('close-modal');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');

    const authOptions = document.getElementById('auth-options');
    const showLoginBtn = document.getElementById('show-login');
    const showRegisterBtn = document.getElementById('show-register');
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');

    const authBtn = document.querySelector('.auth-btn');
    const logoutBtn = document.querySelector('.logout-btn');

    //Check session status
    async function checkSessionStatus() {
        const res = await fetch('/history');
        const data = await res.json();
        if (data.success) {
            authBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            loadPasswordHistory();
        } else {
            logoutBtn.classList.add('hidden');
            authBtn.classList.remove('hidden');
        }
    }

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

    const value = parseInt(lengthInput.value);
    if (value < 8 || isNaN(value)) {
        generateBtn.disabled = true;
        generateBtn.classList.add('disabled');
        warning.textContent = "⚠️ Password must be at least 8 characters.";
    }

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

        //Send updated theme to database
        fetch('/theme', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme: newTheme })
        });
    });

    //Apply saved theme on load
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    updateToggleText(savedTheme);

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
        const score = evaluateStrength(password);

        //Save to database
        fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                password,
                length: length,
                used_uppercase: includeUpper,
                used_lowercase: includeLower,
                used_numbers: includeNumbers,
                used_symbols: includeSymbols,
                strength_score: score
            })
        });
    });

    //Strength evaluation
    function evaluateStrength(password) {
        const length = password.length;
        let strength = 0;

        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        if (length >= 12) {
            strength++;
        }

        //Update strength bar color
        const colors = ["#ff4d4d", "#ffa94d", "#ffe94d", "#a0e34d", "#4de06e"];
        strengthBar.style.backgroundColor = colors[Math.min(strength -1, 4)];
        strengthBar.style.width = `${(strength / 5) * 100}%`
        return strength;
    }

    //Copy to clipboard
    copyBtn.addEventListener('click', () => {
        const password = passwordField.value;
        if (!password || password.includes("❌")) return;

        navigator.clipboard.writeText(password).then(() => {
            copyBtn.textContent = "Copied!";
            setTimeout(() => {
                copyBtn.textContent = "Copy";
            }, 1500);
        });
    });

    //Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('login-password').value;

        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (data.success) {
            html.setAttribute('data-theme', data.theme || 'light');
            updateToggleText(data.theme || 'light');
            loginError.textContent = '';
            loadPasswordHistory();
            authBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            authModal.classList.add('hidden');
        } else {
            loginError.textContent = data.error || 'Login failed.';
        }
    });

    //Load password history
    async function loadPasswordHistory() {
        const response = await fetch('/history');
        const data = await response.json();
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';

        if (data.success) {
            data.passwords.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.password} - ${new Date(item.generated_at).toLocaleString()}`;
                historyList.appendChild(li);
            });
        }
    }

    //Register
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (data.success) {
            html.setAttribute('data-theme', data.theme || 'light');
            updateToggleText(data.theme || 'light');
            registerError.textContent = '';
            loadPasswordHistory();
            authBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            authModal.classList.add('hidden');
        } else {
            registerError.textContent = data.error || 'Account creation failed.';
        }
    });

    //Show modal
    authToggle.addEventListener('click', () => {
        authModal.classList.remove('hidden');
        authOptions.classList.remove('hidden');
        loginSection.classList.add('hidden');
        registerSection.classList.add('hidden');
        showLoginBtn.style.display = 'block';
        showRegisterBtn.style.display = 'block';
        loginError.textContent = '';
        registerError.textContent = '';
        loginForm.reset();
        registerForm.reset();
    });

    //Close modal
    closeModal.addEventListener('click', () => {
        authModal.classList.add('hidden');
        authOptions.classList.remove('hidden');
        showLoginBtn.style.display = '';
        showRegisterBtn.style.display = '';
    });

    //Show login form
    showLoginBtn.addEventListener('click', () => {
        authOptions.classList.add('hidden');
        showLoginBtn.style.display = 'none';
        showRegisterBtn.style.display = 'none';

        loginSection.classList.remove('hidden');
        registerSection.classList.add('hidden');
    });

    //Show register form
    showRegisterBtn.addEventListener('click', () => {
        authOptions.classList.add('hidden');
        showLoginBtn.style.display = 'none';
        showRegisterBtn.style.display = 'none';

        registerSection.classList.remove('hidden');
        loginSection.classList.add('hidden');
    });

    //Logout
    logoutBtn.addEventListener('click', async () => {
        await fetch('/logout', { method: 'POST' });
        logoutBtn.classList.add('hidden');
        authBtn.classList.remove('hidden');
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
    });

});
