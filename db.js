const mysql = require('mysql2');
const fs = require('fs');
const csv = require('csv-parser');
const { connect } = require('http2');
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

fs.createReadStream('./data/normalized_data.csv')
    .pipe(csv())
    .on('data', (row) => {
        const { episode_id, season, episode, painting_title, colors, subjects } = row;
        const seasonInt = parseInt(season, 10);
        const episodeInt = parseInt(episode, 10);

        const query = `
        INSERT INTO paintings (episode_id, season, episode, painting_title, colors, subjects)
        VALUES (?, ?, ?, ?, ?, ?)`;
        connection.execute(query, [episode_id, season, episode, painting_title, colors, subjects]);
    })
    .on('end', () => {
        console.log('Data loaded into mySQL');
        connection.end();
    });

module.exports = {
};