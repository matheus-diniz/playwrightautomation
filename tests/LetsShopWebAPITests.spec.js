const { test, expect } = require('../fixtures/test');
const LetsShopLoginPage = require('../pages/LetsShopLoginPage');
const LetsShopOrdersPage = require('../pages/LetsShopOrdersPage');

test('access dashboard with valid auth token', async ({ authenticatedPage }) => {
    const loginPage = new LetsShopLoginPage(authenticatedPage);
    await loginPage.goTo();

    await expect(authenticatedPage).toHaveURL(/#\/dashboard/);
    await expect(authenticatedPage.locator('#products .card').first()).toBeVisible();
    await expect(
        authenticatedPage.getByRole('textbox', { name: 'email@example.com' })
    ).not.toBeVisible();
});

test('create a new order via API and verify it appears in the dashboard', async ({ authenticatedPage, ordersApi }) => {
    const orderId = await ordersApi.createOrder({
        country: 'India',
        productOrderedId: '6960eac0c941646b7a8b3e68',
    });
    expect(orderId).toBeTruthy();

    const ordersPage = new LetsShopOrdersPage(authenticatedPage);

    const loginPage = new LetsShopLoginPage(authenticatedPage);
    await loginPage.goTo();

    await ordersPage.goToOrders();
    await ordersPage.searchAndViewOrder(orderId);
});