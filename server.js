const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path')
const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static('public'));

app.use(session({
    secret: 'super-secret-password',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: true}
}));

//MySQL
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Me&Mine2027!',
    database: 'project'
});

//Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query('SELCT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'User not found!' });
        }

        const user =rows[0];
        const valid = await bcrypt.compare(password, user.hashed_password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid password!' });
        }

        req.session.userID = user.userID;
        req.session.sessionID = req.sessionID;

        //Save session in sessions table
        await db.query(
            'INSERT INTO sessions (sessionID, created_at) VALUES (?, NOW())', [req.sessionID]
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