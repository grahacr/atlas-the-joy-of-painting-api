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


async function insertEpisodes(episodes) {
    for (const episode of episodes) {
        
        const existingEpisodeId = await findEpisodeIdbyTitle(episode.painting_title);
        
        if (existingEpisodeId) {
            console.log(`episode with title "${episode.painting_title}" already exists with ID ${existingEpisodeId}`);

            await insertSubjects([{ episode_id: existingEpisodeId, subjects: episode.subjects }]);
            await insertColors([{ episode_id: existingEpisodeId, colors: episode.colors }]);
        } else {
            const episodeId = await insertEpisode(episode);
            console.log('Inserting subjects and colors for episode ID:', episodeId);
            await insertSubjects([{ episode_id: episodeId, subjects: episode.subjects }]);
            await insertColors([{ episode_id: episodeId, colors: episode.colors }]);
        }
    }
}

function insertEpisode(episode) {
    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO episodes (painting_title, air_date, month) VALUES (?, ?, ?)`,
            [episode.painting_title, episode.air_date, episode.month],
            (err, results) => {
                if (err) {
                    console.error('Error inserting episode', err);
                    return reject(err);
                }
                resolve(results.insertId);
            }
        );
    });
}


function insertSubjects(subjectData) {

    // console.log(subjectData);
    if (Array.isArray(subjectData)) {
        subjectData.forEach(subject => {
            const episodeId = subject.episode_id;
            const subjects = subject.subjects;
            if (subjects && subjects.length > 0) {
                const subjectValues = subjects.map(subject => [episodeId, subject]);
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
            } else {
                console.log('No subjects to insert for episode ID:', episodeId);
            }
        });
    } else {
        console.log('expected an array but got:', subjectData);
    }
}

function insertColors(colorsData) {
    // console.log('Inserting colors for paintings..');
    
    const values = [];
    
    // console.log('colorsData:', colorsData);
    // console.log('Type of colorsData:', typeof colorsData);
    if (Array.isArray(colorsData)) {
        colorsData.forEach(colorEntry => {
            const episodeId = colorEntry.episode_id;
            const parsedColors = colorEntry.colors;
            // console.log('parsed colors:', parsedColors);
    
            //console.log('inserting colors for painting:', colorEntry.painting_title);
            if (Array.isArray(parsedColors) && parsedColors.length > 0) {
                parsedColors.forEach(color => {
                    const colorName = color.trim();
                    if (colorName) {
                    values.push([episodeId, colorName]);
                    }
                });
            }
        });
    }

    if (values.length > 0) {
        connection.query(
            `INSERT INTO colors (episode_id, color_name) VALUES ?`,
            [values],
            (err, result) => {
                if (err) {
                    console.error('Error inserting colors:', err);
                } else {
                    console.log(`Inserted ${result.affectedRows} colors for Episode ID ${episodeId}`);
                }
            }
        );
    }
}


module.exports = {
    connection,
    insertEpisodes,
    insertColors,
    insertSubjects
};