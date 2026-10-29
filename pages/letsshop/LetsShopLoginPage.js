const { expect } = require('@playwright/test');

const LOGIN_URL = 'https://rahulshettyacademy.com/client/#/auth/login';

class LetsShopLoginPage {

    /**
     * @param {import('playwright').Page} page
     */
    constructor(page) {
        this.page = page;
    }

    async goTo() {
        await this.page.goto(LOGIN_URL)
    }

    async login(username, password) {
        await this.page.getByRole('textbox', { name: 'email@example.com' }).fill(username);
        await this.page.getByRole('textbox', { name: 'enter your passsword' }).fill(password);
        await this.page.getByRole('button', { name: 'Login' }).click();
    }

    async createAccount(firstName, lastName, email, phoneNumber, password, gender, occupation) {
        await this.page.getByText('Don\'t have an account?').click();
        await this.page.getByRole('textbox', { name: 'First Name' }).fill(firstName);
        await this.page.getByRole('textbox', { name: 'Last Name' }).fill(lastName);
        await this.page.getByRole('textbox', { name: 'email@example.com' }).fill(email);
        await this.page.getByRole('textbox', { name: 'enter your number' }).fill(phoneNumber);

        await this.selectGender(gender);
        await this.selectOccupation(occupation);

        await this.page.locator('#userPassword').fill(password);
        await this.page.getByRole('textbox', { name: 'Confirm Password', exact: true }).fill(password);

        await this.isOlderThan18();

        await this.page.getByRole('button', { name: 'Register' }).click();
    }

    async selectGender(gender) {
        switch (gender) {
            case 'Male':
                await this.page.getByRole('radio', { name: 'Male', exact: true }).check();
                break;
            case 'Female':
                await this.page.getByRole('radio', { name: 'Female', exact: true }).check();
                break;
            default:
                throw new Error(`Invalid gender: ${gender}`);
        }
    }

    async selectOccupation(occupation) {
        await this.page.getByRole('combobox').selectOption({ label: occupation });
    }

    async isOlderThan18() {
        const olderThan18Checkbox = this.page.getByRole('checkbox');

        if (!(await olderThan18Checkbox.isChecked())) {
            await olderThan18Checkbox.check();
        }

        await expect(olderThan18Checkbox).toBeChecked();
    }
}

 module.exports = LetsShopLoginPage;