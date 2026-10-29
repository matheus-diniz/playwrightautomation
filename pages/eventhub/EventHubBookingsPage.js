class EventHubBookingsPage {
    constructor(page) {
        this.page = page;
        this.bookingCards = page.locator('#booking-card');
    }

    getBookingCard(bookingRef) {
        const matchingReference = this.page.locator('.booking-ref').filter({ hasText: bookingRef });
        return this.bookingCards.filter({ has: matchingReference });
    }

    async openFromConfirmation(viewMyBookingsLink) {
        await viewMyBookingsLink.click();
    }
}

module.exports = EventHubBookingsPage;
