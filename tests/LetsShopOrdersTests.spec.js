const { test, expect } = require('@playwright/test');
const LetsShopLoginPage = require('../pages/LetsShopLoginPage');
const LetsShopDashboardPage = require('../pages/LetsShopDashboardPage');
const LetsShopCartPage = require('../pages/LetsShopCartPage');
const LetsShopCheckoutPage = require('../pages/LetsShopCheckoutPage');
const LetsShopOrdersPage = require('../pages/LetsShopOrdersPage');

test.beforeEach(async ({ page }) => {
    const email = process.env.LETSHOP_EMAIL;
    const password = process.env.LETSHOP_PASSWORD;

    if (!email || !password) {
        throw new Error('Set LETSHOP_EMAIL and LETSHOP_PASSWORD environment variables.');
    }

    const loginPage = new LetsShopLoginPage(page);
    await loginPage.goTo();
    await loginPage.login(email, password);

    await expect(page.getByLabel('Login Successfully')).toBeVisible();
    await expect(page).toHaveURL(/dashboard/);
});

async function createOrder(page, testInfo) {
    const dashboardPage = new LetsShopDashboardPage(page);
    const cartPage = new LetsShopCartPage(page);
    const checkoutPage = new LetsShopCheckoutPage(page);

    await dashboardPage.addProductToCart('ADIDAS ORIGINAL');
    await expect(page.getByRole('alert', { name: 'Product Added To Cart' })).toBeVisible();
    await cartPage.goToCart();
    await cartPage.validateProduct('ADIDAS ORIGINAL');
    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/#\/dashboard\/order(?:\?.*)?$/);

    await checkoutPage.fillPaymentDetails('123', 'Test Buyer');
    await checkoutPage.fillShippingInformation(process.env.LETSHOP_EMAIL, 'India');
    await checkoutPage.placeOrder();
    await checkoutPage.validateOrderConfirmation();

    const orderId = await checkoutPage.getOrderId();
    await testInfo.attach('order-id.txt', {
        body: orderId,
        contentType: 'text/plain',
    });

    return orderId;
}

test('searches and views an order by order ID', async ({ page }, testInfo) => {
    const orderId = await createOrder(page, testInfo);
    const ordersPage = new LetsShopOrdersPage(page);

    await ordersPage.goToOrders();
    await ordersPage.searchAndViewOrder(orderId);
});

test('deletes an order by order ID', async ({ page }, testInfo) => {
    const orderId = await createOrder(page, testInfo);
    const ordersPage = new LetsShopOrdersPage(page);

    await ordersPage.goToOrders();
    await ordersPage.deleteOrder(orderId);
});
