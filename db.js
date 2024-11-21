const mysql = require('mysql2');
require('dotenv').config();


const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to database', err);
        return;
    }
    console.log('Connected to the database!');
});

function insertEpisodes(episodes) {
    episodes.forEach(episode => {
        const { title, air_date, month } = episode;
        const query = `INSERT INTO episodes (title, air_date, month) VALUES (?, ?, ?)`;
        connection.query(query, [title, air_date, month], (err, results) => {
            if (err) {
                console.error('error inserting episode', err);
            } else {
                console.log('Inserted episode', results);
            }
        });
    });
}


module.exports = { connection, insertEpisodes };