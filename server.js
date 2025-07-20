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
