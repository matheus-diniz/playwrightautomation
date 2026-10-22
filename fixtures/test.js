const { test: base, expect } = require('@playwright/test');
const AuthApi = require('../api/AuthApi');
const OrdersApi = require('../api/OrdersApi');

const test = base.extend({
    authToken: async ({ request }, use) => {
        const email = process.env.TEST_USER_EMAIL;
        const password = process.env.TEST_USER_PASSWORD;

        if (!email || !password) {
            throw new Error('DATA NOT FOUND: Please set TEST_USER_EMAIL and TEST_USER_PASSWORD in environment variables.');
        }

        const authApi = new AuthApi(request);
        const authToken = await authApi.login(email, password);

        await use(authToken);
    },

    authenticatedPage: async ({ page, authToken }, use) => {
        await page.addInitScript(token => {
            window.localStorage.setItem('token', token);
        }, authToken);

        await use(page);
    },

    ordersApi: async ({ request, authToken }, use) => {
        await use(new OrdersApi(request, authToken));
    },
});

module.exports = { test, expect };
