const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { randomUUID } = require('crypto');
const EventHubAuthApi = require('../../api/EventHubAuthApi');
const EventHubLoginPage = require('../../pages/eventhub/EventHubLoginPage');
const EventHubRegisterPage = require('../../pages/eventhub/EventHubRegisterPage');
const EventHubAdminEventsPage = require('../../pages/eventhub/EventHubAdminEventsPage');
const EventHubEventsPage = require('../../pages/eventhub/EventHubEventsPage');
const EventHubBookingPage = require('../../pages/eventhub/EventHubBookingPage');
const EventHubBookingsPage = require('../../pages/eventhub/EventHubBookingsPage');

const EVENTHUB_URL = 'https://eventhub.rahulshettyacademy.com';

function futureDateValue() {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    futureDate.setHours(12, 0, 0, 0);
    const localDate = new Date(futureDate.getTime() - futureDate.getTimezoneOffset() * 60_000);
    return localDate.toISOString().slice(0, 16);
}

function configuredUser() {
    return {
        email: EventHubAuthApi.requiredCredential('TEST_USER_EMAIL'),
        password: EventHubAuthApi.requiredCredential('TEST_USER_PASSWORD'),
    };
}

Given('I open the EventHub registration page', async function () {
    this.eventHubRegisterPage = new EventHubRegisterPage(this.page);
    await this.eventHubRegisterPage.goto();
});

When('I register a unique EventHub account', async function () {
    this.eventHubRegistrationUser = {
        email: `eventhub-${randomUUID()}@example.com`,
        password: `EventHubQA@${randomUUID().slice(0, 8)}1`,
    };
    await this.eventHubRegisterPage.register(this.eventHubRegistrationUser);
});

Then('the EventHub account registration succeeds', async function () {
    await expect(this.page).toHaveURL(`${EVENTHUB_URL}/`);
    await expect(this.page.getByText(this.eventHubRegistrationUser.email)).toBeVisible();
});

Given('I open the EventHub login page', async function () {
    this.eventHubLoginPage = new EventHubLoginPage(this.page);
    await this.eventHubLoginPage.goto();
});

When('I sign in to EventHub with invalid credentials', async function () {
    await this.eventHubLoginPage.submitCredentials({
        email: `unregistered-${randomUUID()}@example.com`,
        password: `WrongPassword@${randomUUID().slice(0, 8)}`,
    });
});

Then('the EventHub login error is displayed', async function () {
    await expect(this.eventHubLoginPage.errorMessage).toBeVisible();
    await expect(this.page).toHaveURL(/\/login(?:[?#]|$)/);
    await expect(this.eventHubLoginPage.browseEventsLink).not.toBeVisible();
});

Given('I sign in to EventHub with configured credentials', async function () {
    const user = configuredUser();
    this.eventHubLoginPage = new EventHubLoginPage(this.page);
    await this.eventHubLoginPage.login(user);
    this.eventHubToken = await new EventHubAuthApi(this.api).login(user.email, user.password);
});

When('I create a unique EventHub event with {int} seats', async function (totalSeats) {
    this.eventHubEventTitle = `Test Event ${Date.now()}`;
    this.eventHubAdminEventsPage = new EventHubAdminEventsPage(this.page);
    await this.eventHubAdminEventsPage.goto();
    await this.eventHubAdminEventsPage.createEvent({
        title: this.eventHubEventTitle,
        description: 'Automated end-to-end booking verification event.',
        city: 'Bengaluru',
        venue: 'QA Automation Convention Center',
        dateTime: futureDateValue(),
        price: 100,
        totalSeats,
    });
    await expect(this.eventHubAdminEventsPage.successToast).toBeVisible();

    this.eventHubEventsPage = new EventHubEventsPage(this.page);
    await this.eventHubEventsPage.goto();
    await expect(this.eventHubEventsPage.eventCards.first()).toBeVisible();
    this.eventHubEventCard = this.eventHubEventsPage.getEventCard(this.eventHubEventTitle);
    await expect(this.eventHubEventCard).toBeVisible({ timeout: 5_000 });
    this.seatsBeforeBooking = await this.eventHubEventsPage.getSeatCount(this.eventHubEventCard);
    expect(this.seatsBeforeBooking).toBe(totalSeats);

    const eventLink = this.eventHubEventCard.getByRole('link', { name: this.eventHubEventTitle });
    const eventPath = await eventLink.getAttribute('href');
    const eventId = eventPath?.match(/\/events\/(\d+)/)?.[1];
    if (!eventId) {
        throw new Error(`Could not extract the event ID for "${this.eventHubEventTitle}".`);
    }
    this.eventHubEvent = { id: eventId, title: this.eventHubEventTitle };
});

When('I book one ticket for the created EventHub event', async function () {
    await this.eventHubEventsPage.bookNow(this.eventHubEventCard);
    this.eventHubBookingPage = new EventHubBookingPage(this.page);
    await expect(this.eventHubBookingPage.ticketCount).toHaveText('1');
    await this.eventHubBookingPage.fillCustomerDetails({
        fullName: 'EventHub QA Tester',
        email: configuredUser().email,
        phone: '+919876543210',
    });
    await this.eventHubBookingPage.confirmBooking();
    this.bookingRef = await this.eventHubBookingPage.getBookingReference();
});

Then('the booking is listed in My Bookings', async function () {
    this.eventHubBookingsPage = new EventHubBookingsPage(this.page);
    await this.eventHubBookingsPage.openFromConfirmation(this.eventHubBookingPage.viewMyBookingsLink);
    await expect(this.page).toHaveURL(`${EVENTHUB_URL}/bookings`);
    await expect(this.eventHubBookingsPage.bookingCards.first()).toBeVisible();

    const bookingCard = this.eventHubBookingsPage.getBookingCard(this.bookingRef);
    await expect(bookingCard).toBeVisible();
    await expect(bookingCard).toContainText(this.eventHubEventTitle);
});

Then('the EventHub event has one fewer available seat', async function () {
    await this.eventHubEventsPage.goto();
    await expect(this.eventHubEventsPage.eventCards.first()).toBeVisible();
    const eventCard = this.eventHubEventsPage.getEventCard(this.eventHubEventTitle);
    await expect(eventCard).toBeVisible();
    const seatsAfterBooking = await this.eventHubEventsPage.getSeatCount(eventCard);
    expect(seatsAfterBooking).toBe(this.seatsBeforeBooking - 1);
});

When('I submit the blank EventHub event form', async function () {
    this.eventHubAdminEventsPage = new EventHubAdminEventsPage(this.page);
    await this.eventHubAdminEventsPage.goto();
    this.eventHubInitialEventCount = await this.eventHubAdminEventsPage.eventRows.count();
    await this.eventHubAdminEventsPage.submitBlankForm();
});

Then('EventHub required-field validation prevents creation', async function () {
    await expect(this.eventHubAdminEventsPage.invalidFields).toHaveCount(6);
    await expect(this.eventHubAdminEventsPage.successToast).not.toBeVisible();
    await expect(this.eventHubAdminEventsPage.eventRows).toHaveCount(this.eventHubInitialEventCount);
});
