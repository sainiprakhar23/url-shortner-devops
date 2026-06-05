import request from 'supertest';
import express from 'express';

const app = express();
app.get('/', (req, res) => res.json({ status: 'Server is up and running...' }));

describe('Health Check', () => {
  it('should return server status', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('Server is up and running...');
  });
});
