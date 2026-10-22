const { randomUUID } = require('crypto');
const { test: base, expect } = require('@playwright/test');
const EventHubLoginPage = require('../pages/EventHubLoginPage');

const API_URL = 'https://api.eventhub.rahulshettyacademy.com/api';

function getTestUser() {
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    if (!email || !password) {
        throw new Error('DATA NOT FOUND: Please set TEST_USER_EMAIL and TEST_USER_PASSWORD in environment variables.');
    }

    return { email, password };
}

async function requireSuccessfulResponse(response, operation) {
    if (!response.ok()) {
        throw new Error(`${operation} failed with status ${response.status()}: ${await response.text()}`);
    }
}

const test = base.extend({
    authenticatedPage: async ({ page }, use) => {
        const loginPage = new EventHubLoginPage(page);
        await loginPage.login(getTestUser());
        await use(page);
    },

    createEvent: async ({ request }, use) => {
        const user = getTestUser();
        const loginResponse = await request.post(`${API_URL}/auth/login`, {
            data: user,
        });
        await requireSuccessfulResponse(loginResponse, 'EventHub API login');

        const loginBody = await loginResponse.json();
        const token = loginBody.token;
        if (!token) {
            throw new Error('EventHub API login response did not include a token.');
        }

        const eventTitle = `Playwright Fixture Event ${randomUUID()}`;
        const createResponse = await request.post(`${API_URL}/events`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            data: {
                title: eventTitle,
                description: 'Event created by a Playwright fixture.',
                category: 'Conference',
                venue: 'Playwright Test Venue',
                city: 'Hyderabad',
                eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                price: 100,
                totalSeats: 50,
            },
        });
        await requireSuccessfulResponse(createResponse, 'EventHub create event');

        const createBody = await createResponse.json();
        const createdEvent = createBody.data;
        if (!createdEvent?.id || createdEvent.title !== eventTitle) {
            throw new Error('EventHub create event response did not include the created event ID and title.');
        }

        await use(createdEvent);

        const deleteResponse = await request.delete(`${API_URL}/events/${createdEvent.id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        await requireSuccessfulResponse(deleteResponse, 'EventHub test event cleanup');
    },
});

module.exports = { test, expect };
