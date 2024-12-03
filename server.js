require('dotenv').config();
const { doesNotMatch } = require('assert');
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
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

function queryPaintings(subject, color, matchType, callback) {
    let query = "SELECT * FROM paintings WHERE 1=1";
    let params = [];
    console.log('Executing query:', query);

    if (subject) {
        let subjects = subject.split(',').map(s => `%${s.trim()}%`);
        let subjectCondition = subjects.map(() => 'subjects LIKE ?').join(matchType === 'all' ? ' AND ' : ' OR ');
        query += ` AND (${subjectCondition})`;
        params.push(...subjects);
    }
    if (color) {
        let colors = color.split(',').map(c => `%${c.trim()}%`);
        let colorCondition = colors.map(() => 'colors LIKE ?').join(matchType === 'all' ? ' AND ' : ' OR ');
        query += ` AND (${colorCondition})`;
        params.push(...colors);
    }
    console.log('Executing query:', query);

    connection.execute(query, params, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/paintings', (req, res) => {
    const { subject, color, matchType = 'all' } = req.query;
    console.log(`Received query with subject: ${subject} and color(s): ${color}, ${matchType}`);
    queryPaintings(subject, color, matchType, (err, paintings) => {
        if (err) {
            return res.status(500).json({ error: 'Dabase query error' });
        }
        if (paintings.length === 0) {
            res.json({ message: 'No paintings found' });
        } else {
            return res.json(paintings)
        }
    });
});

app.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
});