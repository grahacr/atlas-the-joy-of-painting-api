require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database: ', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

function queryPaintings(subject, color, callback) {
    let query = "SELECT * FROM paintings WHERE 1=1";
    let params = [];

    if (subject) {
        query += " AND subjects LIKE ?";
        params.push(`%${subject}%`);
    }
    if (color) {
        query += " AND colors LIKE ?";
        params.push(`%${color}%`);
    }

    connection.execute(query, params, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            callback(err, null);
        }
        callback(null, results);
    });
}

app.get('/api/paintings', (req, res) => {
    const { subject, color } = req.query;
    console.log(`Received query with subject: ${subject} and color(s): ${color}`);
    queryPaintings(subject, color, (err, paintings) => {
        if (err) {
            return res.status(500).json({ error: 'Dabase query error' });
        }
        return res.json(paintings)
    });
});

app.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
});