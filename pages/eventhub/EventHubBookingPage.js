const { expect } = require('@playwright/test');

class EventHubBookingPage {
    constructor(page) {
        this.page = page;
        this.ticketCount = page.locator('#ticket-count');
        this.fullNameInput = page.getByLabel('Full Name');
        this.emailInput = page.locator('#customer-email');
        this.phoneInput = page.getByPlaceholder('+91 98765 43210');
        this.confirmButton = page.locator('.confirm-booking-btn');
        this.bookingReference = page.locator('.booking-ref').first();
        this.viewMyBookingsLink = page.getByRole('link', { name: 'View My Bookings' });
    }

    async fillCustomerDetails(customer) {
        await this.fullNameInput.fill(customer.fullName);
        await this.emailInput.fill(customer.email);
        await this.phoneInput.fill(customer.phone);
    }

    async confirmBooking() {
        await this.confirmButton.click();
        await expect(this.bookingReference).toBeVisible();
    }

    async getBookingReference() {
        await expect(this.bookingReference).toBeVisible();
        const bookingRef = (await this.bookingReference.innerText()).trim();

        if (!bookingRef) {
            throw new Error('The booking confirmation did not contain a reference.');
        }

        return bookingRef;
    }
}

module.exports = EventHubBookingPage;
