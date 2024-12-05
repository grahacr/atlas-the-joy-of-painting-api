require('dotenv').config();
const { doesNotMatch } = require('assert');
const { countReset } = require('console');
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

function queryPaintings(subject, color, matchType, offset, limit, callback) {
    let query = "SELECT * FROM paintings WHERE 1=1";
    let params = [];
    console.log('initial query:', query);

    if (subject && subject.trim() !== '') {
        let subjects = subject.split(',').map(s => `%${s.trim()}%`);
        let subjectCondition = subjects.map(() => 'subjects LIKE ?').join(matchType === 'all' ? ' AND ' : ' OR ');
        query += ` AND (${subjectCondition})`;
        params.push(...subjects);
    }
    if (color && color.trim() !== "") {
        let colors = color.split(',').map(c => `%${c.trim()}%`);
        let colorCondition = colors.map(() => 'colors LIKE ?').join(matchType === 'all' ? ' AND ' : ' OR ');
        query += ` AND (${colorCondition})`;
        params.push(...colors);
    }
    query += ` LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;

    console.log('Executing final query:', query);
    console.log('final params:', params);

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
    const { subject, color, matchType = 'all', page = Number(req.query.page), limit = Number(req.query.limit) } = req.query;
    const offset = (page - 1) * limit;
    console.log(`Received query with subject: ${subject} and color(s): ${color}, ${matchType}, page: ${page}, limit: ${limit}`);

    queryPaintings(subject, color, matchType, offset, limit, (err, paintings) => {
        if (err) {
            return res.status(500).json({ error: 'Dabase query error' });
        }
        if (paintings.length === 0) {
            return res.json({ message: 'No paintings found' });
        }

        connection.execute("SELECT COUNT(*) AS total FROM paintings WHERE 1=1", (err, countResult) => {
            if (err) {
                return res.status(500).json({ error: 'Error counting paintings' });
            }

            const totalRecords = countResult[0].total;
            const totalPages = Math.ceil(totalRecords / limit);
            res.json({
                paintings,
                currentPage: parseInt(page),
                totalPages: totalPages
            });
        });
    });
});
app.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
});