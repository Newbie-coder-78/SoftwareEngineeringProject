const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname)));

app.use(session({
    secret: 'super-secret-password',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

//MySQL
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',  //Your MySql password
    database: 'project'
});

//Session initialization
app.post('/api/init-session', async (req, res) => {
    try {
        if (!req.session.sessionID) {
        const [result] = await db.query(
            'INSERT INTO sessions (created_at, theme) VALUES (NOW(), ?)',
            ['dark']
        );
        req.session.sessionID = result.insertId;
        req.session.theme = 'dark';
        }
        if (!req.session.passwords) {
            req.session.passwords = [];
        }
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to initialize session.' });
    }
});

//Register
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already exists!' });
        }

        const hashed = await bcrypt.hash(password, 10);

        //Fetch session theme if available
        let sessionTheme = 'dark';
        try {
            const [sessionRows] = await db.query(
                'SELECT theme FROM sessions WHERE sessionID = ?', [req.session.sessionID]
            );
            if (sessionRows.length > 0) {
                sessionTheme = sessionRows[0].theme || 'dark';
            }
        } catch (err) {
            console.error('Failed to fetch session theme:', err);
            return res.status(500).json({ error: 'Failed to fetch session theme.' });
        }
        const [result] = await db.query(
            'INSERT INTO users (email, hashed_password, theme) VALUES (?, ?, ?)', [email, hashed, sessionTheme]
        );

        req.session.userID = result.insertId;

        await db.query(
            'UPDATE passwords SET userID = ? WHERE sessionID = ? AND userID IS NULL',
            [req.session.userID, req.session.sessionID]
        );

        res.json({ success: true, theme: sessionTheme, message: 'Account created successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create account.' });
    }
});

//Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'User not found!' });
        }

        const user =rows[0];
        const valid = await bcrypt.compare(password, user.hashed_password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid password!' });
        }

        req.session.userID = user.userID;

        //Save session in sessions table
        await db.query(
            'UPDATE passwords SET userID = ? WHERE sessionID = ? AND userID IS NULL', [user.userID, req.session.sessionID]
        );

        res.json({ success: true, theme: user.theme || 'light' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed!' });
    }
});

//Add sections here

//Serve Index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

//Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
//Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'User not found!' });
        }

        const user =rows[0];
        const valid = await bcrypt.compare(password, user.hashed_password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid password!' });
        }

        req.session.userID = user.userID;

        //Save session in sessions table
        await db.query(
            'UPDATE passwords SET userID = ? WHERE sessionID = ? AND userID IS NULL', [user.userID, req.session.sessionID]
        );

        res.json({ success: true, theme: user.theme || 'light' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed!' });
    }
});

//Logout
app.post('/logout', async (req, res) => {
    if (req.session) {
        const sessionID = req.session.sessionID;
        await db.query('DELETE FROM sessions WHERE sessionID = ?', [sessionID]);
        req.session.destroy(() => res.json({ success: true }));
    } else {
        res.json({ success: true });
    }
});

//Save generated password
app.post('/generate', async (req, res) => {
    const userID = req.session.userID;
    const sessionID = req.session.sessionID;
    if (!sessionID) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
        password,
        length,
        used_uppercase,
        used_lowercase,
        used_numbers,
        used_symbols,
        strength_score
    } = req.body;

    try {
        await db.query(`
            INSERT INTO passwords
            (userID, password, length, used_uppercase, used_lowercase, used_numbers, used_symbols, strength_score, generated_at, sessionID)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
        `, [userID || null, password, length, used_uppercase, used_lowercase, used_numbers, used_symbols, strength_score, sessionID]);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save password' });
    }
});
