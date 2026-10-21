const { test, expect } = require('@playwright/test');
const LetsShopLoginPage = require('../pages/LetsShopLoginPage');
const LetsShopDashboardPage = require('../pages/LetsShopDashboardPage');
const LetsShopCartPage = require('../pages/LetsShopCartPage');
const LetsShopCheckoutPage = require('../pages/LetsShopCheckoutPage');

async function openCheckoutWithProduct(page, productName) {
    const dashboardPage = new LetsShopDashboardPage(page);
    const cartPage = new LetsShopCartPage(page);
    const checkoutPage = new LetsShopCheckoutPage(page);

    await dashboardPage.addProductToCart(productName);
    await expect(page.getByRole('alert', { name: 'Product Added To Cart' })).toBeVisible();
    await cartPage.goToCart();
    await cartPage.validateProduct(productName);
    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/#\/dashboard\/order(?:\?.*)?$/);
    await checkoutPage.validateProductInCheckout(productName);

    return checkoutPage;
}

test.beforeEach(async ({ page }) => {
    const email = process.env.LETSHOP_EMAIL;
    const password = process.env.LETSHOP_PASSWORD;

    if (!email || !password) {
        throw new Error('DATA NOT FOUND: Please set LETSHOP_EMAIL and LETSHOP_PASSWORD in environment variables.');
    }

    const loginPage = new LetsShopLoginPage(page);
    await loginPage.goTo();
    await loginPage.login(email, password);

    await expect(page.getByLabel('Login Successfully')).toBeVisible();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/dashboard/);
});

test('search, add and validate product on cart', async ({ page }) => {
    const dashboardPage = new LetsShopDashboardPage(page);
    const cartPage = new LetsShopCartPage(page);

    const productName = 'ADIDAS ORIGINAL';
    await dashboardPage.addProductToCart(productName);

    await expect(page.getByRole('alert', { name: 'Product Added To Cart' })).toBeVisible();
    await cartPage.goToCart();
    await cartPage.validateProduct(productName);
});

test('search, add and remove product from cart', async ({ page }) => {
    const dashboardPage = new LetsShopDashboardPage(page);
    const cartPage = new LetsShopCartPage(page);

    const productName = 'ADIDAS ORIGINAL';
    await dashboardPage.addProductToCart(productName);

    await expect(page.getByRole('alert', { name: 'Product Added To Cart' })).toBeVisible();
    await cartPage.goToCart();
    await cartPage.validateProduct(productName);
    await cartPage.removeProduct(productName);
    await cartPage.validateProductNotInCart(productName);
});


test('search, add and proceed to checkout', async ({ page }) => {
    await openCheckoutWithProduct(page, 'ADIDAS ORIGINAL');
});

test('does not place order without CVV and cardholder name', async ({ page }) => {
    const checkoutPage = await openCheckoutWithProduct(page, 'ADIDAS ORIGINAL');

    await checkoutPage.fillShippingInformation(process.env.LETSHOP_EMAIL, 'India');
    await checkoutPage.placeOrder();

    await expect(page).toHaveURL(/#\/dashboard\/order(?:\?.*)?$/);
    await expect(page.getByText('Thankyou for the order.', { exact: true })).not.toBeVisible();
});

test('does not place order without selecting a country', async ({ page }) => {
    const checkoutPage = await openCheckoutWithProduct(page, 'ADIDAS ORIGINAL');

    await checkoutPage.fillPaymentDetails('123', 'Test Buyer');
    await checkoutPage.placeOrder();

    await expect(page).toHaveURL(/#\/dashboard\/order(?:\?.*)?$/);
    await expect(page.getByText('Thankyou for the order.', { exact: true })).not.toBeVisible();
});

test('places order successfully without a coupon', async ({ page }, testInfo) => {
    const checkoutPage = await openCheckoutWithProduct(page, 'ADIDAS ORIGINAL');

    await checkoutPage.fillPaymentDetails('123', 'Test Buyer');
    await checkoutPage.fillShippingInformation(process.env.LETSHOP_EMAIL, 'India');
    await checkoutPage.placeOrder();
    await checkoutPage.validateOrderConfirmation();

    const orderId = await checkoutPage.getOrderId();
    await testInfo.attach('order-id.txt', {
        body: orderId,
        contentType: 'text/plain',
    });
});
