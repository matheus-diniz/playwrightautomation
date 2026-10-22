const { expect } = require('@playwright/test');

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';

class EventHubLoginPage {
    constructor(page) {
        this.page = page;
    }

    async login(user) {
        await this.page.goto(`${BASE_URL}/login`);
        await this.page.getByLabel('Email').fill(user.email);
        await this.page.getByLabel('Password').fill(user.password);
        await this.page.getByRole('button', { name: 'Sign In' }).click();

        await expect(this.page).not.toHaveURL(/\/login(?:[?#]|$)/);
    }
}

module.exports = EventHubLoginPage;
