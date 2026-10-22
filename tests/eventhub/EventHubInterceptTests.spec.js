const { test, expect } = require('@playwright/test');
const EventHubLoginPage = require('../../pages/EventHubLoginPage');

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';

const SIX_EVENTS_RESPONSE = {
    data: [
        { id: 1, title: 'Tech Summit 2025', category: 'Conference', eventDate: '2025-06-01T10:00:00.000Z', venue: 'HICC', city: 'Hyderabad', price: '999', totalSeats: 200, availableSeats: 150, imageUrl: null, isStatic: false },
        { id: 2, title: 'Rock Night Live', category: 'Concert', eventDate: '2025-06-05T18:00:00.000Z', venue: 'Palace Grounds', city: 'Bangalore', price: '1500', totalSeats: 500, availableSeats: 300, imageUrl: null, isStatic: false },
        { id: 3, title: 'IPL Finals', category: 'Sports', eventDate: '2025-06-10T19:30:00.000Z', venue: 'Chinnaswamy', city: 'Bangalore', price: '2000', totalSeats: 800, availableSeats: 50, imageUrl: null, isStatic: false },
        { id: 4, title: 'UX Design Workshop', category: 'Workshop', eventDate: '2025-06-15T09:00:00.000Z', venue: 'WeWork', city: 'Mumbai', price: '500', totalSeats: 50, availableSeats: 20, imageUrl: null, isStatic: false },
        { id: 5, title: 'Lollapalooza India', category: 'Festival', eventDate: '2025-06-20T12:00:00.000Z', venue: 'Mahalaxmi Racecourse', city: 'Mumbai', price: '3000', totalSeats: 5000, availableSeats: 2000, imageUrl: null, isStatic: false },
        { id: 6, title: 'AI & ML Expo', category: 'Conference', eventDate: '2025-06-25T10:00:00.000Z', venue: 'Bangalore International Exhibition Centre', city: 'Bangalore', price: '750', totalSeats: 300, availableSeats: 180, imageUrl: null, isStatic: false },
    ],
    pagination: { page: 1, totalPages: 1, total: 6, limit: 12 },
};

const FOUR_EVENTS_RESPONSE = {
    data: [
        { id: 1, title: 'Tech Summit 2025', category: 'Conference', eventDate: '2025-06-01T10:00:00.000Z', venue: 'HICC', city: 'Hyderabad', price: '999', totalSeats: 200, availableSeats: 150, imageUrl: null, isStatic: false },
        { id: 2, title: 'Rock Night Live', category: 'Concert', eventDate: '2025-06-05T18:00:00.000Z', venue: 'Palace Grounds', city: 'Bangalore', price: '1500', totalSeats: 500, availableSeats: 300, imageUrl: null, isStatic: false },
        { id: 3, title: 'IPL Finals', category: 'Sports', eventDate: '2025-06-10T19:30:00.000Z', venue: 'Chinnaswamy', city: 'Bangalore', price: '2000', totalSeats: 800, availableSeats: 50, imageUrl: null, isStatic: false },
        { id: 4, title: 'UX Design Workshop', category: 'Workshop', eventDate: '2025-06-15T09:00:00.000Z', venue: 'WeWork', city: 'Mumbai', price: '500', totalSeats: 50, availableSeats: 20, imageUrl: null, isStatic: false },
    ],
    pagination: { page: 1, totalPages: 1, total: 4, limit: 12 },
};

async function loginAndGoToEvents(page) {
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    if (!email || !password) {
        throw new Error('DATA NOT FOUND: Please set TEST_USER_EMAIL and TEST_USER_PASSWORD in environment variables.');
    }

    const loginPage = new EventHubLoginPage(page);
    await loginPage.login({ email, password });
    await page.goto(`${BASE_URL}/events`);
}

async function mockEventsResponse(page, responseBody) {
    await page.route('**/api/events**', route => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(responseBody),
    }));
}

test('shows the sandbox banner when the API returns six events', async ({ page }) => {
    await mockEventsResponse(page, SIX_EVENTS_RESPONSE);
    await loginAndGoToEvents(page);

    const eventCards = page.getByTestId('event-card');
    await expect(eventCards.first()).toBeVisible();
    await expect(eventCards).toHaveCount(6);

    const banner = page.getByText(/sandbox holds up to/i);
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('9 bookings');
});

test('hides the sandbox banner when the API returns four events', async ({ page }) => {
    await mockEventsResponse(page, FOUR_EVENTS_RESPONSE);
    await loginAndGoToEvents(page);

    const eventCards = page.getByTestId('event-card');
    await expect(eventCards.first()).toBeVisible();
    await expect(eventCards).toHaveCount(4);

    const banner = page.getByText(/sandbox holds up to/i);
    await expect(banner).not.toBeVisible();
});
