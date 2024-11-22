const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const { connection, insertEpisodes } = require('./db');
const moment = require('moment');
const regex = new RegExp('pattern');

class csvProcessor {
    constructor(filePath, dbInsertFunction, hasHeaders = true) {
        this.filePath = filePath;
        this.dbInsertFunction = dbInsertFunction;
        this.hasHeaders = hasHeaders;
        this.data = [];
    }

    processFile() {
        console.log('starting file processing:', this.filePath);
        if (this.hasHeaders) {
            this.processWithHeaders();
        } else {
            this.processWithoutHeaders();
        }
    }

    processWithHeaders() {
        const headerOptions = { skipEmptyLines: true, headers: true };
        console.log('starting file processing:', this.filePath)
        fs.createReadStream(this.filePath)
            .pipe(csvParser(headerOptions))
            .on('data', (dataRow) => this.processData(dataRow))
            .on('end', () => this.dbInsertFunction(this.data))
            .on('error', (err) => console.error('Error parsing csv', err));
    }

    processWithoutHeaders() {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8');
        const lines = fileContent.split('\n').map(line => line.trim());
        lines.forEach(line => {
            if (line) {
                this.processData(line);
            }
        });
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
        const match = line.match(/^"([^"]+)" \(([^)]+)\)$/);
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
const episodesProcesser = new episodesCSVProcesser(path.join(__dirname, 'data', 'episodes'));
episodesProcesser.processFile();