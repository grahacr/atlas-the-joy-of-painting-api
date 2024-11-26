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
                // insertSubjects(results.insertId);
                // insertColors(results.insertId);
            }
        );
    });
}

function insertSubjects(episodes) {
    episodes.forEach(episode => {
        if (episode.subjects && episode.subjects.length > 0) {
            const episodeId = episode.episode_id;
            const subjectValues = episode.subjects.map(subject => [episodeId, subject]);

            connection.query(
                `INSERT INTO subjects (episode_id, subject_name) VALUES ?`,
                [subjectValues],
                (err, result) => {
                    if (err) {
                        console.error('Error inserting subjects:', err);
                    } else {
                        console.log(`Inserted ${result.affectedRows} subjects for episode ID ${episodeId}`);
                    }
                }
            );
        }
    });
}

function insertColors(colorsData) {
    console.log('Inserting colors for paintings..');
    colorsData.forEach(colorEntry => {
        const parsedColors = colorEntry.colors;
        console.log('inserting colors for painting:', colorEntry.painting_title);

        connection.query(
            `INSERT INTO colors (painting_title, colors) VALUES (?, ?)`,
            [colorEntry.painting_title, JSON.stringify(parsedColors)],
            (err, result) => {
                if (err) {
                    console.error('Error inserting colors:', err);
                } else {
                    console.log(`Inserted ${result.affectedRows} colors for Episode ID ${episodeId}`);
                }
            }
        );
    });
}


module.exports = {
    connection,
    insertEpisodes,
    insertColors,
    insertSubjects
};