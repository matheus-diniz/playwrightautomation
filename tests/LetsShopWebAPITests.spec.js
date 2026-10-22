const { test, expect, request } = require('@playwright/test');
const LetsShopLoginPage = require('../pages/LetsShopLoginPage');
const LetsShopOrdersPage = require('../pages/LetsShopOrdersPage');
const AuthApi = require('../api/AuthApi');
const OrdersApi = require('../api/OrdersApi');

let authToken;
let apiContext;

test.beforeAll(async () => {
    const email = process.env.LETSHOP_EMAIL;
    const password = process.env.LETSHOP_PASSWORD;

    if (!email || !password) {
        throw new Error('DATA NOT FOUND: Please set LETSHOP_EMAIL and LETSHOP_PASSWORD in environment variables.');
    }

    apiContext = await request.newContext();
    const authApi = new AuthApi(apiContext);
    authToken = await authApi.login(email, password);
});

test.afterAll(async () => {
    await apiContext?.dispose();
});

test.beforeEach(async ({ page }) => {
    await page.addInitScript(value => {
        window.localStorage.setItem('token', value);
    }, authToken);
});

test('access dashboard with valid auth token', async ({ page }) => {
    const loginPage = new LetsShopLoginPage(page);
    await loginPage.goTo();

    await expect(page).toHaveURL(/#\/dashboard/);
    await expect(page.locator('#products .card').first()).toBeVisible();
    await expect(
        page.getByRole('textbox', { name: 'email@example.com' })
    ).not.toBeVisible();
});

test('create a new order via API and verify it appears in the dashboard', async ({ page }) => {
    const ordersApi = new OrdersApi(apiContext);
    const orderId = await ordersApi.createOrder(authToken, {
        country: 'India',
        productOrderedId: '6960eac0c941646b7a8b3e68',
    });
    expect(orderId).toBeTruthy();

    const ordersPage = new LetsShopOrdersPage(page);

    const loginPage = new LetsShopLoginPage(page);
    await loginPage.goTo();

    await ordersPage.goToOrders();
    await ordersPage.searchAndViewOrder(orderId);
});