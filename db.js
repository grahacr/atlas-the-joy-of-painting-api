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
    episodes.forEach((episode) => {
        connection.query(
            `INSERT INTO episodes (painting_title, air_date, month) VALUES (?, ?, ?)`,
            [episode.painting_title, episode.air_date, episode.month],
            (err, results) => {
                if (err) {
                    console.error('Error inserting episode', err);
                    return;
                }
                console.log(`Episode inserted! ID: ${results.insertId}`);
            }
        )
    });
}


module.exports = { connection, insertEpisodes };