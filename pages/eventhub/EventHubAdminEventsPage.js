const { expect } = require('@playwright/test');

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';

class EventHubAdminEventsPage {
    constructor(page) {
        this.page = page;
        this.titleInput = page.locator('#event-title-input');
        this.descriptionInput = page.locator('#admin-event-form textarea');
        this.cityInput = page.getByLabel('City');
        this.venueInput = page.getByLabel('Venue');
        this.dateTimeInput = page.getByLabel('Event Date & Time');
        this.priceInput = page.getByLabel('Price ($)');
        this.totalSeatsInput = page.getByLabel('Total Seats');
        this.addEventButton = page.locator('#add-event-btn');
        this.successToast = page.getByText('Event created!', { exact: true });
        this.eventRows = page.locator('table tbody tr');
        this.invalidFields = page.locator('#admin-event-form :invalid');
    }

    async goto() {
        await this.page.goto(`${BASE_URL}/admin/events`);
    }

    async createEvent(event) {
        await this.titleInput.fill(event.title);
        await this.descriptionInput.fill(event.description);
        await this.cityInput.fill(event.city);
        await this.venueInput.fill(event.venue);
        await this.dateTimeInput.fill(event.dateTime);
        await this.priceInput.fill(String(event.price));
        await this.totalSeatsInput.fill(String(event.totalSeats));
        await this.addEventButton.click();
        await expect(this.successToast).toBeVisible();
    }

    async submitBlankForm() {
        await this.addEventButton.click();
    }
}

module.exports = EventHubAdminEventsPage;
