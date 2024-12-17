const request = require('supertest');
const { app, startServer, connection, initializeDbConnection } = require('./server');

describe('GET /api/paintings', () => {
    let server;

    beforeAll(() => {
        server = startServer();
    });

    afterAll(async () => {
        await new Promise(resolve => server.close(resolve));
        connection.end();
    });

    it('should return paintings and pagination info', async () => {
        const response = await request(app)
            .get('/api/paintings')
            .query({ subjects: 'PERSON', colors: 'Bright Red', page: 1, limit: 16 });
        
        console.log('Response status:', response.status);
        console.log('Response body:', response.body);

        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty('paintings');
        expect(response.body).toHaveProperty('currentPage');
        expect(response.body).toHaveProperty('totalPages');

        expect(Array.isArray(response.body.paintings)).toBe(true);
        expect(response.body.paintings.length).toBeGreaterThan(0);

        const painting = response.body.paintings[0];
        expect(painting).toHaveProperty('episode_id');
        expect(painting).toHaveProperty('painting_title');
        expect(painting).toHaveProperty('subjects');
        expect(painting).toHaveProperty('colors');
    });

    it('should return invalid page number error', async() => {
        const response = await request(app)
            .get('/api/paintings')
            .query({ page: 'invalid' });
        console.log('Response status for invalid page:', response.status);
        console.log('Response body for invalid page:', response.body);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('invalid page number');
    });
});