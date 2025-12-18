const request = require('supertest');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Mock console to keep output clean
global.console = {
    ...console,
    // log: jest.fn(),
    // error: jest.fn(),
};

describe('Server API Integration', () => {
    let app;

    beforeAll(() => {
        process.env.NODE_ENV = 'test';
        process.env.ADMIN_USERNAME = 'Admin';
        process.env.ADMIN_PASSWORD_HASH = '$2b$10$x7dmeNWzxfqz40W8tgxp7OhT3YJcxQO5yPpv7FG/77mDAgXjvMedgO'; // Pass123
        // Mock session secret to avoid warning
        process.env.SESSION_SECRET = 'test_secret';

        // Import app (it won't listen due to our wrapper)
        jest.isolateModules(() => {
            app = require('../server');
        });
    });

    const req = () => request(app);

    test('GET / should return 200 via Clean URL', async () => {
        const res = await req().get('/');
        expect(res.statusCode).toBe(200);
    });

    test('GET /contact.html should redirect to /contact', async () => {
        const res = await req().get('/contact.html');
        expect(res.statusCode).toBe(301);
        expect(res.headers.location).toBe('/contact');
    });

    test('GET /gallery.html should redirect to /gallery', async () => {
        const res = await req().get('/gallery.html');
        expect(res.statusCode).toBe(301);
        expect(res.headers.location).toBe('/gallery');
    });

    test('GET /admin.html should redirect to /admin', async () => {
        const res = await req().get('/admin.html');
        expect(res.statusCode).toBe(301);
        expect(res.headers.location).toBe('/admin');
    });

    test('POST /api/submit with valid data should succeed', async () => {
        const res = await req().post('/api/submit').send({
            full_name: 'Test Testson',
            phone: '0400000000',
            email: 'test@example.com',
            message: 'Integration Test Message'
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test('POST /api/submit with missing data should fail', async () => {
        const res = await req().post('/api/submit').send({
            full_name: 'Test Only'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test('POST /api/admin/login with wrong password should fail', async () => {
        const res = await req().post('/api/admin/login').send({
            username: 'Admin',
            password: 'wrongpassword'
        });
        expect(res.statusCode).toBe(401);
    });

    test('POST /api/admin/login with correct password should succeed and allow access', async () => {
        const agent = request.agent(app);

        // 1. Login
        const loginRes = await agent.post('/api/admin/login').send({
            username: 'Admin',
            password: 'Pass123'
        });
        expect(loginRes.statusCode).toBe(200);
        expect(loginRes.body.success).toBe(true);

        // 2. Access Protected Route
        const protectedRes = await agent.get('/api/admin/submissions');
        expect(protectedRes.statusCode).toBe(200);
        expect(protectedRes.body.success).toBe(true);
        expect(Array.isArray(protectedRes.body.data)).toBe(true);
    });
});
