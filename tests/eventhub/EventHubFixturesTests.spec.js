const { test, expect } = require('../../fixtures/eventhub');

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';

test('displays an event created by the API fixture', async ({ authenticatedPage, createEvent }) => {
    await authenticatedPage.goto(`${BASE_URL}/events`);
    await expect(authenticatedPage.getByText(createEvent.title, { exact: true })).toBeVisible();
});
