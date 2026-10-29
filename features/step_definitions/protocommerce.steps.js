const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const ProtoCommerceLoginPage = require('../../pages/protocommerce/ProtoCommerceLoginPage');

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
    this.protoCommerceLoginPage = new ProtoCommerceLoginPage(this.page);
    await this.protoCommerceLoginPage.goto();
});

When('I sign in to ProtoCommerce with invalid credentials', async function () {
    await this.protoCommerceLoginPage.signIn(INVALID_USER);
});

When('I sign in to ProtoCommerce with valid credentials', async function () {
    await this.protoCommerceLoginPage.signIn(VALID_USER);
});

Then('I see the invalid credentials message', async function () {
    await expect(this.page.getByText(/Incorrect username\/password/i)).toBeVisible();
});

Then('I see the ProtoCommerce shop', async function () {
    await expect(this.page).toHaveTitle(/ProtoCommerce/i);
    await expect(this.page.getByRole('heading', { name: 'Shop Name' })).toBeVisible();
});
