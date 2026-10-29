const BASE_URL = 'https://eventhub.rahulshettyacademy.com';

class EventHubRegisterPage {
    constructor(page) {
        this.page = page;
        this.emailInput = page.getByPlaceholder('you@email.com');
        this.passwordInput = page.getByPlaceholder('Min 8 chars, uppercase, number & symbol');
        this.confirmPasswordInput = page.getByPlaceholder('Repeat your password');
        this.createAccountButton = page.locator('#register-btn');
    }

    async goto() {
        await this.page.goto(`${BASE_URL}/register`);
    }

    async register(user) {
        await this.emailInput.fill(user.email);
        await this.passwordInput.fill(user.password);
        await this.confirmPasswordInput.fill(user.password);
        await this.createAccountButton.click();
    }
}

module.exports = EventHubRegisterPage;
