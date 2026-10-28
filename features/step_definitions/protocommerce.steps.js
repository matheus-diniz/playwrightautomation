const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

const INVALID_USER = {
    username: 'matheus',
    password: 'password',
    type: 'User',
    role: 'Consultant',
};
const VALID_USER = {
    username: 'rahulshettyacademy',
    password: 'Learning@830$3mK2',
    type: 'Admin',
    role: 'Student',
};

Given('I open the ProtoCommerce login page', async function () {
    await this.page.goto('https://rahulshettyacademy.com/loginpagePractise/');
    await expect(this.page).toHaveTitle(/LoginPage Practise/i);
});

When('I sign in to ProtoCommerce with invalid credentials', async function () {
    await signIn(this.page, INVALID_USER);
});

When('I sign in to ProtoCommerce with valid credentials', async function () {
    await signIn(this.page, VALID_USER);
});

Then('I see the invalid credentials message', async function () {
    await expect(this.page.getByText(/Incorrect username\/password/i)).toBeVisible();
});

Then('I see the ProtoCommerce shop', async function () {
    await expect(this.page).toHaveTitle(/ProtoCommerce/i);
    await expect(this.page.getByRole('heading', { name: 'Shop Name' })).toBeVisible();
});

async function signIn(page, user) {
    await page.getByRole('textbox', { name: 'Username:' }).fill(user.username);
    await page.getByRole('textbox', { name: 'Password:' }).fill(user.password);
    if (user.type === 'User') {
        await page.getByRole('radio', { name: 'User' }).check();
        await expect(page.getByText('You will be limited to only')).toBeVisible();
        await page.getByRole('button', { name: 'Okay' }).click();
        await expect(page.getByRole('radio', { name: 'User' })).toBeChecked();
    }

    await page.getByRole('combobox').selectOption({ label: user.role });
    const termsCheckbox = page.getByRole('checkbox', { name: /I Agree to the terms/i });
    if (!(await termsCheckbox.isChecked())) {
        await termsCheckbox.check();
    }
    await expect(termsCheckbox).toBeChecked();
    await page.getByRole('button', { name: 'Sign In' }).click();
}
