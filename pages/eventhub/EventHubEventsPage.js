const BASE_URL = 'https://eventhub.rahulshettyacademy.com';

class EventHubEventsPage {
    constructor(page) {
        this.page = page;
        this.eventCards = page.getByTestId('event-card');
    }

    async goto() {
        await this.page.goto(`${BASE_URL}/events`);
    }

    getEventCard(eventTitle) {
        return this.eventCards.filter({ hasText: eventTitle });
    }

    async getSeatCount(eventCard) {
        const seatCountText = await eventCard
            .getByText(/\d[\d,]* seats? (?:available|left!?)/i)
            .first()
            .innerText();
        const match = seatCountText.match(/[\d,]+/);

        if (!match) {
            throw new Error(`Could not parse a seat count from event text: ${seatCountText}`);
        }

        const seatCount = Number.parseInt(match[0].replaceAll(',', ''), 10);
        if (!Number.isInteger(seatCount)) {
            throw new Error(`Could not parse a seat count from event text: ${seatCountText}`);
        }

        return seatCount;
    }

    async bookNow(eventCard) {
        await eventCard.getByTestId('book-now-btn').click();
    }
}

module.exports = EventHubEventsPage;
