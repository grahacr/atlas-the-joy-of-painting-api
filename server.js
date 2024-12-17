require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const winston = require('winston');
const { combine, timestamp, json } = winston.format;

const app = express();
const port = process.env.PORT || 3000;

const logger = winston.createLogger({
    level: 'info',
    format: combine(timestamp(), json()),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: 'log.log',
        }),
    ],
});

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME

});

function initializeDbConnection() {
    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to database: ', err);
        } else {
            console.log('Connected to MySQL database');
        }
    });
}

function startServer() {
    const server = app.listen(port, () => {
        console.log(`server running at http://localhost:${port}`);
        initializeDbConnection();
    });
    return server;
}
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

function queryPaintings(subject, color, matchType, offset, limit, callback) {
    let query = "SELECT * FROM paintings WHERE 1=1";
    let params = [];
    logger.info('initial query:', { query });

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

    logger.info('Executing final query:', { query });
    logger.info('final params:', { params });

    connection.execute(query, params, (err, results) => {
        if (err) {
            logger.error('Error executing query:', { error: err });
            callback(err, null);
        } else {
            logger.info('Query results:', { results });
            callback(null, results);
        }
    });
}

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/paintings', (req, res) => {
    const { subject, color, matchType = 'all', page = 1, limit = 16 } = req.query;
    const pageNumber = parseInt(page);
    if (isNaN(pageNumber) || pageNumber < 1) {
        return res.status(400).json({ error: 'invalid page number' });
    }
    const offset = (pageNumber - 1) * limit;

    console.log(`Received query with subject: ${subject} and color(s): ${color}, ${matchType}, page: ${pageNumber}, limit: ${limit}`);
    console.log(`Calculated offset: ${offset}`);
    
    connection.execute("SELECT COUNT(*) AS total FROM paintings WHERE 1=1", (err, countResult) => {
        if (err) {
            return res.status(500).json({ error: 'Error counting paintings' });
        }
        const totalRecords = countResult[0].total;
        const totalPages = Math.ceil(totalRecords / limit);
        queryPaintings(subject, color, matchType, offset, limit, (err, paintings) => {
            if (err) {
                return res.status(500).json({ error: 'Dabase query error' });
            }
            res.json({
                paintings,
                currentPage: pageNumber,
                totalPages: totalPages
            });
        });
    });
});

module.exports = { app, startServer, connection, initializeDbConnection };