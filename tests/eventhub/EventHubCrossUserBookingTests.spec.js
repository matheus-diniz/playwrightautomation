const { randomUUID } = require('crypto');
const { test, expect } = require('@playwright/test');
const { loginAs } = require('./helpers');

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';
const API_URL = 'https://api.eventhub.rahulshettyacademy.com/api';
const TEST_PASSWORD = 'EventHubTest@12345';

async function registerUser(request, user) {
    const response = await request.post(`${API_URL}/auth/register`, {
        data: {
            email: user.email,
            password: user.password,
        },
    });

    expect(response.status()).toBe(201);
}

test('denies a user access to another user booking', async ({ request, page }) => {
    const uniqueId = randomUUID();
    const yahooUser = {
        email: `yahoo-${uniqueId}@example.com`,
        password: TEST_PASSWORD,
    };
    const gmailUser = {
        email: `gmail-${uniqueId}@example.com`,
        password: TEST_PASSWORD,
    };

    await registerUser(request, yahooUser);
    await registerUser(request, gmailUser);

    const yahooLoginResponse = await request.post(`${API_URL}/auth/login`, {
        data: {
            email: yahooUser.email,
            password: yahooUser.password,
        },
    });
    expect(yahooLoginResponse.ok()).toBeTruthy();

    const yahooLoginBody = await yahooLoginResponse.json();
    const yahooToken = yahooLoginBody.token;
    expect(yahooToken).toBeTruthy();

    const authHeaders = {
        Authorization: `Bearer ${yahooToken}`,
    };
    const eventsResponse = await request.get(`${API_URL}/events`, {
        headers: authHeaders,
    });
    expect(eventsResponse.ok()).toBeTruthy();

    const eventsBody = await eventsResponse.json();
    const eventId = eventsBody.data?.[0]?.id;
    expect(eventId).toBeTruthy();

    const bookingResponse = await request.post(`${API_URL}/bookings`, {
        headers: authHeaders,
        data: {
            eventId,
            customerName: 'Yahoo User',
            customerEmail: yahooUser.email,
            customerPhone: '9876543210',
            quantity: 1,
        },
    });
    expect(bookingResponse.ok()).toBeTruthy();

    const bookingBody = await bookingResponse.json();
    const yahooBookingId = bookingBody.data?.id;
    expect(yahooBookingId).toBeTruthy();

    await loginAs(page, gmailUser);
    await page.goto(`${BASE_URL}/bookings/${yahooBookingId}`, {
        waitUntil: 'networkidle',
    });

    await expect(page.getByText('Access Denied', { exact: true })).toBeVisible();
    await expect(
        page.getByText('You are not authorized to view this booking.', { exact: true })
    ).toBeVisible();
});
