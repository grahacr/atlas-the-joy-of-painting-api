const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
// const { connection } = require('./db');
// const moment = require('moment');
// const { match } = require('assert');
const regex = new RegExp('pattern');
const { createObjectCsvWriter } = require('csv-writer');
const { escapeId } = require('mysql2');

const colorPath = path.join(__dirname, 'data', 'colors.csv');
const subjectPath = path.join(__dirname, 'data', 'subjects.csv');

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


class subjectsCsvProcessor extends csvProcessor {
    constructor(filePath, episodeData) {
        super(filePath, episodeData);
    }

    processData(dataRow) {
        const cleanedTitle = normalizeTitle(dataRow['TITLE']?.trim());
        const episodeId = `${dataRow['EPISODE']}`;

        const subjects = [];
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
        
        if (subjects.length > 0) {
            if (!this.episodeData[episodeId]) {
                this.episodeData[episodeId] = {
                    episode_id: episodeId,
                    season: episodeId.slice(1, 3),
                    episode: episodeId.slice(4,6),
                    painting_title: cleanedTitle,
                    colors: '',
                    subjects: []
                };
            }
            const existingSubjects = this.episodeData[episodeId].subjects || [];
            this.episodeData[episodeId].subjects = Array.from(new Set([...existingSubjects, ...subjects]));
        } else {
            console.log('No subjects found for episode:', episodeId);
        }
    }
}

class colorsCsvProcessor extends csvProcessor {
    constructor(filePath, episodeData) {
        super(filePath, episodeData);
    }
    processData(dataRow) {
        const cleanedTitle = normalizeTitle(dataRow['painting_title']?.trim());
        const colors = dataRow['colors']?.trim();
        const season = dataRow['season'];
        const episode = dataRow['episode'];

        // console.log(`Processing painting: ${cleanedTitle} with colors: ${colors}`);

        if (!colors || typeof colors !== 'string') {
            console.log('No color data found for painting:', cleanedTitle);
            return;
        }
        
        try {
            const colorRegex = /\s*'([^']+)'\s*/g;
            let match;
            const validColors = [];

            while ((match = colorRegex.exec(colors)) !== null) {
                const color = match[1].trim();
                if (color) {
                    console.log('color:', color);
                    validColors.push(color);
                }
            }
            if (validColors.length === 0) {
                console.log('No valid colors for painting:', cleanedTitle);
                return;
            }
            console.log('Valid colors:', validColors);

            const episodeId = `S${season.padStart(2, '0')}E${episode.padStart(2, '0')}`;
            if (this.episodeData[episodeId]) {
                const existingColors = this.episodeData[episodeId].colors || '';
                const newColors = validColors.join(', ');

                console.log(`Adding colors to episode ${episodeId}: ${newColors}`);

                if (newColors) {
                    this.episodeData[episodeId].colors += (existingColors ? ', ' : '') + newColors;
                }
            } else {
                console.log(`No episode data found for ${episodeId} to add colors`);
            } 
        } catch (err) {
            console.error(`Error parsing color data for painting: ${cleanedTitle}`, err);
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
                { id: 'painting_title', title: 'painting_title'},
                { id: 'colors', title: 'colors' },
                { id: 'subjects', title: 'subjects' }
            ]
        });
    }
    
    async processData() {
        const subjectProcessor = new subjectsCsvProcessor(subjectPath, this.episodeData);
        await subjectProcessor.processFile();
        
        const colorProcessor = new colorsCsvProcessor(colorPath, this.episodeData);
        await colorProcessor.processFile();

        const combinedData = Object.values(this.episodeData);
        if (combinedData.length > 0) {
            // console.log('Data to write:', combinedData);
            await this.csvWriter.writeRecords(combinedData);
            console.log('Normalized data saved to CSV', path.join(__dirname, 'data', 'normalized_data.csv'));
        } else {
            console.log('No valid data found to write to new csv');
        }
    }
}

async function processAllData() {
    const processor = new normalizedDataProcessor();
    await processor.processData();
    console.log('Data processing complete!');
}
processAllData().catch(err => console.error('Error processing data', err));