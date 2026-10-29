const { expect } = require('@playwright/test');

const LOGIN_URL = 'https://rahulshettyacademy.com/loginpagePractise/';

class ProtoCommerceLoginPage {
    constructor(page) {
        this.page = page;
    }

    async goto() {
        await this.page.goto(LOGIN_URL);
        await expect(this.page).toHaveTitle(/LoginPage Practise/i);
    }

    async signIn(user) {
        await this.page.getByRole('textbox', { name: 'Username:' }).fill(user.username);
        await this.page.getByRole('textbox', { name: 'Password:' }).fill(user.password);
        if (user.type === 'User') {
            const userRole = this.page.getByRole('radio', { name: 'User' });
            await userRole.check();
            await expect(this.page.getByText('You will be limited to only')).toBeVisible();
            await this.page.getByRole('button', { name: 'Okay' }).click();
            await expect(userRole).toBeChecked();
        }

        await this.page.getByRole('combobox').selectOption({ label: user.role });
        const termsCheckbox = this.page.getByRole('checkbox', { name: /I Agree to the terms/i });
        if (!(await termsCheckbox.isChecked())) {
            await termsCheckbox.check();
        }
        await expect(termsCheckbox).toBeChecked();
        await this.page.getByRole('button', { name: 'Sign In' }).click();
    }
}

module.exports = ProtoCommerceLoginPage;
