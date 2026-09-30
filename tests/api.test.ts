import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 1: API Integration Tests', () => {
  it('creates a new user and returns 201', async () => {
    const response = await request(app)
      .post('/users')
      .set('X-User-Id', '1')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Test User');
    expect(response.body.email).toBe('testuser@example.com');
  });

  it('rejects POST request when X-User-Id is missing', async () => {
    const response = await request(app).post('/tickets').send({
      title: 'Test Ticket',
      description: 'Testing authentication',
    });

    expect(response.status).toBe(401);
  });

  it('creates a new ticket and returns 201', async () => {
    // Create a user first
    const userResponse = await request(app)
      .post('/users')
      .set('X-User-Id', '1')
      .send({
        name: 'Ticket Test User',
        email: `tickettest${Date.now()}@example.com`,
      });

    expect(userResponse.status).toBe(201);

    const userId = userResponse.body.id;

    // Use the actual ID of the user we just created
    const response = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(userId))
      .send({
        title: 'Integration Test Ticket',
        description: 'Created during API integration test',
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Integration Test Ticket');
    expect(response.body.description).toBe(
      'Created during API integration test',
    );
    expect(response.body.creator_id).toBe(userId);
  });

  it('returns 404 for a non-existent user', async () => {
    const response = await request(app).get('/users/999999');

    expect(response.status).toBe(404);
  });

  it('returns 404 for a non-existent ticket', async () => {
    const response = await request(app).get('/tickets/999999');

    expect(response.status).toBe(404);
  });

  it('supports pagination on GET /tickets', async () => {
    const response = await request(app).get('/tickets?limit=2&offset=0');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(2);
  });

  it('supports status filtering on GET /tickets', async () => {
    const response = await request(app).get('/tickets?status=TODO');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    for (const ticket of response.body) {
      expect(ticket.status).toBe('TODO');
    }
  });
});
