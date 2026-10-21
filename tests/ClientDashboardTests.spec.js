const { test, expect } = require('@playwright/test');

const LetsShopLoginPage = require('../pages/LetsShopLoginPage');

test('invalid login attempt', async ({ page }) => {
    const loginPage = new LetsShopLoginPage(page);
    await loginPage.goTo();
    await loginPage.login('invalid@example.com', 'invalidpassword');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('alert', { name: 'Incorrect email or password.' })).toBeVisible();
});


test('valid login attempt', async ({ page }) => {
    const loginPage = new LetsShopLoginPage(page);
    await loginPage.goTo();
    await loginPage.login('terra@terramail.com.br', 'Test@1234');
    await expect(page.getByLabel('Login Successfully')).toBeVisible();
    await page.waitForLoadState('networkidle');
});


test('create new account', async ({ page }) => {
    const { faker } = await import('@faker-js/faker');
    const loginPage = new LetsShopLoginPage(page);
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const emailName = `${firstName}.${lastName}`
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const user = {
        firstName,
        lastName,
        email: `${emailName}.${faker.string.uuid().slice(0, 3)}@playwrighttest.com.br`,
        phoneNumber: faker.string.numeric(10),
        password: 'Test@12345',
        gender: faker.helpers.arrayElement(['Male', 'Female']),
        occupation: 'Engineer',
    };

    await loginPage.goTo();
    await loginPage.createAccount(
        user.firstName,
        user.lastName,
        user.email,
        user.phoneNumber,
        user.password,
        user.gender,
        user.occupation
    );
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Account Created Successfully' })).toBeVisible();

});