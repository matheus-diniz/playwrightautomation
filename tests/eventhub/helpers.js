const { expect } = require('@playwright/test');

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';

async function loginAs(page, user) {
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).not.toHaveURL(/\/login(?:[?#]|$)/);
}

module.exports = { loginAs };
