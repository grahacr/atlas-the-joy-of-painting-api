const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const { connection, insertEpisodes, insertSubjects, insertColors } = require('./db');
const moment = require('moment');
const regex = new RegExp('pattern');

class csvProcessor {
    constructor(filePath, dbInsertFunction, hasHeaders = true) {
        this.filePath = filePath;
        this.dbInsertFunction = dbInsertFunction;
        this.hasHeaders = hasHeaders;
        this.data = [];
    }

    async processFile() {
        console.log('starting file processing:', this.filePath);
        if (this.hasHeaders) {
            await this.processWithHeaders();
        } else {
            await this.processWithoutHeaders();
        }
    }

    async processWithHeaders() {
        const headerOptions = { skipEmptyLines: true, header: true };
        console.log('starting file processing:', this.filePath)
        return new Promise((resolve, reject) => {
            fs.createReadStream(this.filePath)
            .pipe(csvParser(headerOptions))
            .on('data', (dataRow) => this.processData(dataRow))
            .on('end', () => {
                this.dbInsertFunction(this.data);
                resolve();
            })
            .on('error', (err) => {
                console.error('Error parsing csv', err)
                reject(err);
            });
        })
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

class episodesCSVProcesser extends csvProcessor {
    constructor(filePath) {
        super(filePath, insertEpisodes, false);
    }
    processData(line) {
        const match = line.match(/^"([^"]+)" \(([^)]+)\)(.*)$/);
        if (match) {
            const title = match[1];
            const airDateString = match[2];
            const airDateFormat = moment(airDateString, 'MMMM D, YYYY').format('YYYY-MM-DD');
            const month = moment(airDateFormat).format('MMMM');

            this.data.push({
                painting_title: title,
                air_date: airDateFormat,
                month: month
            });
        } else {
            console.error('failed to match line', line);
        }
    }
}

class colorsCsvProcessor extends csvProcessor {
    constructor(filePath) {
        super(filePath, insertColors, true);
    }
    processData(dataRow) {
        const painting_title = dataRow['painting_title']?.trim().toLowerCase();
        let colors = dataRow['colors'];
        console.log('Processed colors for painting:', painting_title);

        if (colors) {
            try {
                colors = colors.replace(/'/g, '"');
                colors = JSON.parse(colors);

                if (Array.sArray(colors) && colors.length > 0) {
                    this.data.push({
                        painting_title: painting_title,
                        colors: colors
                    });
                } else {
                    console.log('No colors found for painting:', painting_title);
                }
            } catch (err) {
                console.log('Error parsing colors for painting', err);
            }
        } else {
            console.log('No color data found for painting');
        }
    }
}


class subjectsCsvProcessor extends csvProcessor {
    constructor(filePath) {
        super(filePath, insertSubjects, true);
    }

    processData(dataRow) {
        console.log(dataRow)
        const painting_title = dataRow['TITLE']?.trim().toLowerCase();
        let subjects = [];
        console.log('Processed subjects for painting:', painting_title)
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
            this.data.push({
                painting_title: painting_title,
                subjects: subjects
            });
            console.log('Processed subjects for painting:', painting_title);
        } else {
            console.log('No subjects found for painting', painting_title);
        }
    }
}

async function processAllData() {
    const episodesProcesser = new episodesCSVProcesser(path.join(__dirname, 'data', 'episodes'));
    const colorProcessor = new colorsCsvProcessor(path.join(__dirname, 'data', 'colors'));
    const subjectsProcessor = new subjectsCsvProcessor(path.join(__dirname, 'data', 'subjects'));

    await episodesProcesser.processFile();
    await colorProcessor.processFile();
    await subjectsProcessor.processFile();

    console.log('Data processing complete!');
}

processAllData().catch(err => console.error('Error processing data', err));