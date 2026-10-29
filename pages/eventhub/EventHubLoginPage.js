const { expect } = require('@playwright/test');

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';

class EventHubLoginPage {
    constructor(page) {
        this.page = page;
        this.emailInput = page.getByPlaceholder('you@email.com');
        this.passwordInput = page.getByLabel('Password');
        this.loginButton = page.locator('#login-btn');
        this.browseEventsLink = page.getByRole('link', { name: 'Browse Events →' });
        this.errorMessage = page.getByText('Invalid email or password', { exact: true });
    }

    async goto() {
        await this.page.goto(`${BASE_URL}/login`);
    }

    async submitCredentials(user) {
        if (!user?.email || !user?.password) {
            throw new Error('Both email and password are required to log in to EventHub.');
        }

        await this.emailInput.fill(user.email);
        await this.passwordInput.fill(user.password);
        await this.loginButton.click();
    }

    async login(user) {
        await this.goto();
        await this.submitCredentials(user);
        await expect(this.browseEventsLink).toBeVisible();
    }
}

module.exports = EventHubLoginPage;
