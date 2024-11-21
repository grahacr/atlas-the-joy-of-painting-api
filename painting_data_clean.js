const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const { connection, insertEpisodes } = require('./db');
const moment = require('moment');
const regex = new RegExp('pattern');

const episodes = [];

fs.createReadStream(path.join(__dirname, 'data','episodes'))
    .pipe(csvParser({ headers: false, skipEmptyLines: true }))
    .on('data', (data) => {
        const line = data[0].trim();
        const match = line.match(/^"([^"]+)" \(([^)]+)\)$/);

        if (match) {
            const title = match[1];
            const airDateString = match[2];
            const airDateFormat = moment(airDateString, 'MMMM D, YYYY').format('YYYY-MM-DD');

            const month = moment(airDateFormat).format('MMMM');
            episodes.push({
                title: title,
                air_date: airDateFormat,
                month: month
            });
        }
    })
    .on('end', () => {
        insertEpisodes(episodes);
    })
    .on('error', (err) => {
        console.error('error parsing csv file', err);
    });

