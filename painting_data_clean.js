const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { connection, findEpisodeIdbyTitle, normalizeTitle, insertEpisodes, insertSubjects, insertColors } = require('./db');
const moment = require('moment');
const { match } = require('assert');
const regex = new RegExp('pattern');
const csvWriter = require('csv-writer');

class csvProcessor {
    constructor(filePath, dbInsertFunction, hasHeaders = true) {
        this.filePath = filePath;
        this.dbInsertFunction = dbInsertFunction;
        this.hasHeaders = hasHeaders;
        this.data = [];
    }

    async processFile() {
        // console.log('starting file processing:', this.filePath);
        if (this.hasHeaders) {
            await this.processWithHeaders();
        } else {
            await this.processWithoutHeaders();
        }
    }

    async processWithHeaders() {
        const headerOptions = { skipEmptyLines: true, header: true };
        // console.log('starting file processing:', this.filePath)
        return new Promise((resolve, reject) => {
           const fileStream = fs.createReadStream(this.filePath, 'utf-8');
            Papa.parse(fileStream, {
                header: true,
                skipEmptyLines: true,
                complete:(results) => {
                    results.data.forEach((dataRow) => {
                        this.processData(dataRow);
                    });
                    this.dbInsertFunction(this.data);
                    resolve();
                },
                error: (err) => {
                    console.error('Error parsing CSV', err);
                    reject(err);
                }
            });
        });
    }

    async processWithoutHeaders() {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8');
        const lines = fileContent.split('\n').map(line => line.trim());
        for (const line of lines) {
            if (line) {
                this.processData(line);
            }
        };
        this.dbInsertFunction(this.data);
    }
    processData(data) {
        throw new Error('processData method needs implementation in sublcass')
    }
}


class colorsCsvProcessor extends csvProcessor {
    constructor(filePath) {
        super(filePath, insertColors, true);
    }
    async processData(dataRow) {
        let painting_title = dataRow['painting_title']?.trim();
        console.log('first colors painting title:', painting_title)
        let colors = dataRow['colors']?.trim();
        const season = dataRow['season'];
        const episode = dataRow['episode'];

        //console.log('Raw datarow:', dataRow);
        console.log('Raw colors value:', colors);

        // console.log('Processed colors for painting:', painting_title);
        if (!colors || typeof colors !== 'string') {
            console.log('No color data found for painting:', painting_title);
            return;
        }
        try {
            const parsedColors = colors.split(',').map(color => color.trim());
            const episodeId = await findEpisodeIdbyTitle(painting_title);
            if (!episodeId) {
                // console.log('no episode found for painting title:', painting_title);
                return;
            }
            this.data.push({
                episode_id: episodeId,
                season: season,
                episode: episode,
                colors: parsedColors
            });
        } catch (err) {
            console.log('No colors found for painting:', painting_title);
            }
        }
    }



class subjectsCsvProcessor extends csvProcessor {
    constructor(filePath) {
        super(filePath, insertSubjects, true);
    }
    async processData(dataRow) {
        // console.log(dataRow)

        const painting_title = dataRow['TITLE']?.trim().toLowerCase();
        let subjects = [];
        const episodeSeason = dataRow['EPISODE'];
        const seasonEpisodeMatch = episodeSeason.match(/^S(\d{2})E(\d{2})$/);
        if (!seasonEpisodeMatch) {
            console.log('Invalid EPISODE format for painting:', painting_title);
            return;
        }
        const season = parseInt(seasonEpisodeMatch[1], 10);
        const episode = parseInt(seasonEpisodeMatch[2], 10);

        const episodeId = await findEpisodeIdbyTitle(painting_title);
        if (!episodeId) {
            console.log('no episode found for painting:', painting_title);
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
            //console.log('inserting subjects for episode ID:', matchEpisode.episode_id, subjectValues)
            this.data.push({
                episode_id: episodeId,
                season: season,
                episode: episode,
                subjects: subjects
            });
            //console.log('Processed subjects for painting:', painting_title);
        } else {
            console.log('No subjects found for painting', painting_title);
        }
    }
}
    async function processAllData() {
        const episodesFilePath = path.join(__dirname, 'data', 'episodes.csv');
        console.log('Full episodes file path:', episodesFilePath);
        const episodesProcesser = new episodesCSVProcesser(path.join(__dirname, 'data', 'episodes.csv'));

        const colorProcessor = new colorsCsvProcessor(path.join(__dirname, 'data', 'colors.csv'));
        const subjectsProcessor = new subjectsCsvProcessor(path.join(__dirname, 'data', 'subjects.csv'));

        await episodesProcesser.processFile();
        await colorProcessor.processFile();
        await subjectsProcessor.processFile();

        console.log('Data processing complete!');
    }

processAllData().catch(err => console.error('Error processing data', err));