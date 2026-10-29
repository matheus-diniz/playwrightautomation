const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { randomUUID } = require('crypto');
const EventHubAuthApi = require('../../api/EventHubAuthApi');
const EventHubLoginPage = require('../../pages/eventhub/EventHubLoginPage');

const EVENTHUB_URL = 'https://eventhub.rahulshettyacademy.com';
const EVENTHUB_API_URL = 'https://api.eventhub.rahulshettyacademy.com/api';
const EVENTHUB_TEST_PASSWORD = 'EventHubTest@12345';

async function requireSuccessfulResponse(response, operation) {
    if (!response.ok()) {
        throw new Error(`${operation} failed with status ${response.status()}: ${await response.text()}`);
    }
}

function eventsResponse(count) {
    const events = [
        ['Tech Summit 2025', 'Conference', '2025-06-01T10:00:00.000Z', 'HICC', 'Hyderabad', '999', 200, 150],
        ['Rock Night Live', 'Concert', '2025-06-05T18:00:00.000Z', 'Palace Grounds', 'Bangalore', '1500', 500, 300],
        ['IPL Finals', 'Sports', '2025-06-10T19:30:00.000Z', 'Chinnaswamy', 'Bangalore', '2000', 800, 50],
        ['UX Design Workshop', 'Workshop', '2025-06-15T09:00:00.000Z', 'WeWork', 'Mumbai', '500', 50, 20],
        ['Lollapalooza India', 'Festival', '2025-06-20T12:00:00.000Z', 'Mahalaxmi Racecourse', 'Mumbai', '3000', 5000, 2000],
        ['AI & ML Expo', 'Conference', '2025-06-25T10:00:00.000Z', 'Bangalore International Exhibition Centre', 'Bangalore', '750', 300, 180],
    ].slice(0, count).map((event, index) => ({
        id: index + 1,
        title: event[0],
        category: event[1],
        eventDate: event[2],
        venue: event[3],
        city: event[4],
        price: event[5],
        totalSeats: event[6],
        availableSeats: event[7],
        imageUrl: null,
        isStatic: false,
    }));

    return {
        data: events,
        pagination: { page: 1, totalPages: 1, total: count, limit: 12 },
    };
}

Given('two EventHub users are registered', async function () {
    const uniqueId = randomUUID();
    this.eventHubAuthApi = new EventHubAuthApi(this.api);
    this.eventHubUser = {
        first: { email: `yahoo-${uniqueId}@example.com`, password: EVENTHUB_TEST_PASSWORD },
        second: { email: `gmail-${uniqueId}@example.com`, password: EVENTHUB_TEST_PASSWORD },
    };
    for (const user of Object.values(this.eventHubUser)) {
        await this.eventHubAuthApi.register(user);
    }
});

Given('the first user creates a booking through the API', async function () {
    const loginResponse = await this.api.post(`${EVENTHUB_API_URL}/auth/login`, {
        data: this.eventHubUser.first,
    });
    await requireSuccessfulResponse(loginResponse, 'EventHub first-user login');
    const loginBody = await loginResponse.json();
    expect(loginBody.token).toBeTruthy();

    const headers = { Authorization: `Bearer ${loginBody.token}` };
    const eventsResponse = await this.api.get(`${EVENTHUB_API_URL}/events`, { headers });
    await requireSuccessfulResponse(eventsResponse, 'EventHub events request');
    const eventsBody = await eventsResponse.json();
    const eventId = eventsBody.data?.[0]?.id;
    expect(eventId).toBeTruthy();

    const bookingResponse = await this.api.post(`${EVENTHUB_API_URL}/bookings`, {
        headers,
        data: {
            eventId,
            customerName: 'Yahoo User',
            customerEmail: this.eventHubUser.first.email,
            customerPhone: '9876543210',
            quantity: 1,
        },
    });
    await requireSuccessfulResponse(bookingResponse, 'EventHub booking creation');
    const bookingBody = await bookingResponse.json();
    this.bookingId = bookingBody.data?.id;
    expect(this.bookingId).toBeTruthy();
});

When("the second user opens the first user's booking", async function () {
    await new EventHubLoginPage(this.page).login(this.eventHubUser.second);
    await this.page.goto(`${EVENTHUB_URL}/bookings/${this.bookingId}`, {
        waitUntil: 'networkidle',
    });
});

Then('access to the booking is denied', async function () {
    await expect(this.page.getByText('Access Denied', { exact: true })).toBeVisible();
    await expect(
        this.page.getByText('You are not authorized to view this booking.', { exact: true }),
    ).toBeVisible();
});

Given('I create an EventHub event through the API', async function () {
    const user = {
        email: EventHubAuthApi.requiredCredential('TEST_USER_EMAIL'),
        password: EventHubAuthApi.requiredCredential('TEST_USER_PASSWORD'),
    };
    const loginResponse = await this.api.post(`${EVENTHUB_API_URL}/auth/login`, { data: user });
    await requireSuccessfulResponse(loginResponse, 'EventHub API login');
    const loginBody = await loginResponse.json();
    if (!loginBody.token) {
        throw new Error('EventHub API login response did not include a token.');
    }

    const title = `Cucumber Fixture Event ${randomUUID()}`;
    const createResponse = await this.api.post(`${EVENTHUB_API_URL}/events`, {
        headers: { Authorization: `Bearer ${loginBody.token}` },
        data: {
            title,
            description: 'Event created by a Cucumber scenario.',
            category: 'Conference',
            venue: 'Cucumber Test Venue',
            city: 'Hyderabad',
            eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            price: 100,
            totalSeats: 50,
        },
    });
    await requireSuccessfulResponse(createResponse, 'EventHub create event');
    const createBody = await createResponse.json();
    const createdEvent = createBody.data;
    if (!createdEvent?.id || createdEvent.title !== title) {
        throw new Error('EventHub create event response did not include the created event ID and title.');
    }
    this.eventHubEvent = createdEvent;
    this.eventHubToken = loginBody.token;
});

Given('the EventHub API is mocked to return {int} events', async function (count) {
    await this.page.route('**/api/events**', route => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(eventsResponse(count)),
    }));
});

When('I open the EventHub events page as an authenticated user', async function () {
    const credentials = this.eventHubUser?.second ?? {
        email: EventHubAuthApi.requiredCredential('TEST_USER_EMAIL'),
        password: EventHubAuthApi.requiredCredential('TEST_USER_PASSWORD'),
    };
    await new EventHubLoginPage(this.page).login(credentials);
    await this.page.goto(`${EVENTHUB_URL}/events`);
});

Then('the created event is displayed', async function () {
    await expect(this.page.getByText(this.eventHubEvent.title, { exact: true })).toBeVisible();
});

Then('{int} event cards are displayed', async function (count) {
    const eventCards = this.page.getByTestId('event-card');
    await expect(eventCards.first()).toBeVisible();
    await expect(eventCards).toHaveCount(count);
});

Then('the sandbox banner shows {int} bookings', async function (bookingCount) {
    const banner = this.page.getByText(/sandbox holds up to/i);
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(`${bookingCount} bookings`);
});

Then('the sandbox banner is not displayed', async function () {
    await expect(this.page.getByText(/sandbox holds up to/i)).not.toBeVisible();
});
