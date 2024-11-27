const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { connection, findEpisodeIdbyTitle } = require('./db');
// const moment = require('moment');
// const { match } = require('assert');
const regex = new RegExp('pattern');
const { createObjectCsvWriter } = require('csv-writer');
const { escapeId } = require('mysql2');

function normalizeTitle(title) {
    return title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, ' ')
        .replace(/^./, str => str.toUpperCase());
}

class csvProcessor {
    constructor(filePath, episodeData) {
        this.filePath = filePath;
        this.episodeData = episodeData;
    }
    
    async processFile() {
        const fileStream = fs.createReadStream(this.filePath, 'utf-8');
        return new Promise((resolve, reject) => {
            Papa.parse(fileStream, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    results.data.forEach((dataRow) => {
                        this.processData(dataRow);
                    });
                    resolve();
                },
                error: (err) => {
                    console.error('Error parsing CSV', err);
                    reject(err);
                }
            });
        });
    }

    processData() {
        throw new Error('processData method needs implementation in sublcass')
    }
}


class colorsCsvProcessor extends csvProcessor {
    constructor(filePath, episodeData) {
        super(filePath, episodeData);
    }

    async processData(dataRow) {
        let painting_title = dataRow['painting_title']?.trim();
        const cleanedTitle = normalizeTitle(painting_title);

        console.log('first colors painting title:', cleanedTitle)
        const colors = dataRow['colors']?.trim();
        const season = dataRow['season'];
        const episode = dataRow['episode'];

        //console.log('Raw datarow:', dataRow);
        console.log('Raw colors value:', colors);

        // console.log('Processed colors for painting:', painting_title);
        if (!colors || typeof colors !== 'string') {
            console.log('No color data found for painting:', cleanedTitle);
            return;
        }
        const parsedColors = colors.split(',').map(color => color.trim());
        const episodeId = await findEpisodeIdbyTitle(cleanedTitle);
        if (!episodeId) {
            const episodeId = `${season}-${episode}`;
        }

        if (!this.episodeData[episodeId]) {
            this.episodeData[episodeId] = {
                episode_id: episodeId,
                season: season,
                episode: episode,
                painting_title: cleanedTitle,
                colors: parsedColors.join(', '),
                subjects: []
            };
        } else {
            this.episodeData[episodeId].colors = parsedColors.join(', ');
            }
        }
    }

class subjectsCsvProcessor extends csvProcessor {
    constructor(filePath, episodeData) {
        super(filePath, episodeData);
    }
    async processData(dataRow) {
        // console.log(dataRow)

        const painting_title = dataRow['TITLE']?.trim().toLowerCase();
        const cleanedTitle = normalizeTitle(painting_title);

        let subjects = [];
        const episodeSeason = dataRow['EPISODE'];
        const seasonEpisodeMatch = episodeSeason.match(/^S(\d{2})E(\d{2})$/);
        if (!seasonEpisodeMatch) {
            console.log('Invalid EPISODE format for painting:', cleanedTitle);
            return;
        }
        const season = parseInt(seasonEpisodeMatch[1], 10);
        const episode = parseInt(seasonEpisodeMatch[2], 10);

        const episodeId = await findEpisodeIdbyTitle(cleanedTitle);
        console.log('Found episodeId:', episodeId, 'for title:', cleanedTitle)
        if (!episodeId) {
            console.log('no episode found for painting:', cleanedTitle);
            return;
        }
        const subjectColumns = [
            'APPLE_FRAME', 'AURORA_BOREALIS', 'BARN,BEACH', 'BOAT,BRIDGE', 'BUILDING', 'BUSHES',
            'CABIN', 'CACTUS', 'CIRCLE_FRAME', 'CIRRUS', 'CLIFF', 'CLOUDS', 'CONIFER', 'CUMULUS',
            'DECIDUOUS', 'DIANE_ANDRE', 'DOCK', 'DOUBLE_OVAL_FRAME', 'FARM', 'FENCE', 'FIRE',
            'FLORIDA_FRAME', 'FLOWERS', 'FOG', 'FRAMED', 'GRASS', 'GUEST', 'HALF_CIRCLE_FRAME',
            'HALF_OVAL_FRAME', 'HILLS', 'LAKE', 'LAKES', 'LIGHTHOUSE', 'MILL', 'MOON', 'MOUNTAIN',
            'MOUNTAINS', 'NIGHT', 'OCEAN', 'OVAL_FRAME', 'PALM_TREES', 'PATH', 'PERSON', 'PORTRAIT',
            'RECTANGLE_3D_FRAME', 'RECTANGULAR_FRAME', 'RIVER', 'ROCKS', 'SEASHELL_FRAME', 'SNOW',
            'SNOWY_MOUNTAIN', 'SPLIT_FRAME', 'STEVE_ROSS', 'STRUCTURE', 'SUN', 'TOMB_FRAME', 'TREE',
            'TREES', 'TRIPLE_FRAME', 'WATERFALL', 'WAVES', 'WINDMILL', 'WINDOW_FRAME', 'WINTER', 'WOOD_FRAMED'
        ];

        subjectColumns.forEach(subject => {
            if (dataRow[subject] === '1') {
                subjects.push(subject);
            }
        });

        //console.log('Subjects to be inserted:', subjects)
        if (subjects.length > 0) {
            if (!this.episodeData[episodeId]) {
                this.episodeData[episodeId] = {
                    episode_id: episodeId,
                    season: season,
                    episode, episode,
                    painting_title: cleanedTitle,
                    colors: '',
                    subjects: subjects.join(', '),
                };
            } else {
                this.episodeData[episodeId].subjects = subjects.join(', ');
            }
        } else {
            console.log('No subjects found for painting:', painting_title)
        }
    }
}

class normalizedDataProcessor {
    constructor() {
        this.episodeData = {};
        this.csvWriter = createObjectCsvWriter({
            path: path.join(__dirname, 'data', 'normalized_data.csv'),
            header: [
                { id: 'episode_id', title: 'episode_id' },
                { id: 'season', title: 'season' },
                { id: 'episode', title: 'episode' },
                { id: 'painting_title', title: 'painting_title '},
                { id: 'colors', title: 'colors' },
                { id: 'subjects', title: 'subjects' }
            ]
        });
    }
    
    async processData() {
        const colorProcessor = new colorsCsvProcessor(path.join(__dirname, 'data', 'colors.csv'), this.episodeData);
        const subjectProcessor = new subjectsCsvProcessor(path.join(__dirname, 'data', 'subjects.csv'), this.episodeData);
        
        await colorProcessor.processFile();
        await subjectProcessor.processFile();

        const combinedData = Object.values(this.episodeData);
        if (combinedData.length > 0) {
            await this.csvWriter.writeRecords(combinedData);
            console.log('Normalized data saved to CSV', path.join(__dirname, 'data', 'normalized_data.csv'));
        }
    }
}

async function processAllData() {
    const processor = new normalizedDataProcessor();
    await processor.processData();
    console.log('Data processing complete!');
}
processAllData().catch(err => console.error('Error processing data', err));