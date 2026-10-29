const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { faker } = require('@faker-js/faker');
const AuthApi = require('../../api/AuthApi');
const OrdersApi = require('../../api/OrdersApi.ts');
const LetsShopLoginPage = require('../../pages/letsshop/LetsShopLoginPage');
const LetsShopDashboardPage = require('../../pages/letsshop/LetsShopDashboardPage');
const LetsShopCartPage = require('../../pages/letsshop/LetsShopCartPage');
const LetsShopCheckoutPage = require('../../pages/letsshop/LetsShopCheckoutPage');
const LetsShopOrdersPage = require('../../pages/letsshop/LetsShopOrdersPage');

function requiredCredential(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`DATA NOT FOUND: Please set ${name} in environment variables.`);
    }
    return value;
}

const email = () => requiredCredential('TEST_USER_EMAIL');
const password = () => requiredCredential('TEST_USER_PASSWORD');

async function login(world) {
    const loginPage = new LetsShopLoginPage(world.page);
    await loginPage.goTo();
    await loginPage.login(email(), password());
    await expect(world.page.getByLabel('Login Successfully')).toBeVisible();
    await expect(world.page).toHaveURL(/dashboard/);
}

async function addProduct(world, productName) {
    await new LetsShopDashboardPage(world.page).addProductToCart(productName);
    await expect(world.page.getByRole('alert', { name: 'Product Added To Cart' })).toBeVisible();
}

async function openCartAndCheckout(world, productName) {
    const cartPage = new LetsShopCartPage(world.page);
    const checkoutPage = new LetsShopCheckoutPage(world.page);
    await cartPage.goToCart();
    await cartPage.validateProduct(productName);
    await cartPage.proceedToCheckout();
    await expect(world.page).toHaveURL(/#\/dashboard\/order(?:\?.*)?$/);
    await checkoutPage.validateProductInCheckout(productName);
}

async function createOrder(world) {
    await addProduct(world, 'ADIDAS ORIGINAL');
    await openCartAndCheckout(world, 'ADIDAS ORIGINAL');
    const checkoutPage = new LetsShopCheckoutPage(world.page);
    await checkoutPage.fillPaymentDetails('123', 'Test Buyer');
    await checkoutPage.fillShippingInformation(email(), 'India');
    await checkoutPage.placeOrder();
    await checkoutPage.validateOrderConfirmation();
    world.orderId = await checkoutPage.getOrderId();
    await world.attach(world.orderId, 'text/plain');
}

Given("I open the Let's Shop login page", async function () {
    await new LetsShopLoginPage(this.page).goTo();
});

When("I sign in to Let's Shop with invalid credentials", async function () {
    const loginPage = new LetsShopLoginPage(this.page);
    await loginPage.login('invalid@example.com', 'invalidpassword');
    await this.page.waitForLoadState('networkidle');
});

Then('the login error is displayed', async function () {
    await expect(this.page.getByRole('alert', { name: 'Incorrect email or password.' })).toBeVisible();
});

Given("I sign in to Let's Shop with valid credentials", async function () {
    await login(this);
});

Given("I am signed in to Let's Shop", async function () {
    await login(this);
});

Then('the dashboard is displayed', async function () {
    await expect(this.page.getByLabel('Login Successfully')).toBeVisible();
    await expect(this.page).toHaveURL(/dashboard/);
});

When("I create a new Let's Shop account", async function () {
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
    await new LetsShopLoginPage(this.page).createAccount(
        user.firstName,
        user.lastName,
        user.email,
        user.phoneNumber,
        user.password,
        user.gender,
        user.occupation,
    );
    await this.page.waitForLoadState('networkidle');
});

Then('the account creation confirmation is displayed', async function () {
    await expect(this.page.getByRole('heading', { name: 'Account Created Successfully' })).toBeVisible();
});

When('I add {string} to the cart', async function (productName) {
    this.productName = productName;
    await addProduct(this, productName);
});

When('I open the cart', async function () {
    await new LetsShopCartPage(this.page).goToCart();
});

Then('{string} is present in the cart', async function (productName) {
    await new LetsShopCartPage(this.page).validateProduct(productName);
});

When('I remove {string} from the cart', async function (productName) {
    await new LetsShopCartPage(this.page).removeProduct(productName);
});

Then('{string} is not present in the cart', async function (productName) {
    await new LetsShopCartPage(this.page).validateProductNotInCart(productName);
});

When('I proceed to checkout', async function () {
    await new LetsShopCartPage(this.page).proceedToCheckout();
    await expect(this.page).toHaveURL(/#\/dashboard\/order(?:\?.*)?$/);
    await new LetsShopCheckoutPage(this.page).validateProductInCheckout(this.productName);
});

When('I proceed from the cart to checkout', async function () {
    await openCartAndCheckout(this, this.productName);
});

Then('{string} is shown at checkout', async function (productName) {
    await new LetsShopCheckoutPage(this.page).validateProductInCheckout(productName);
});

When('I enter shipping details', async function () {
    await new LetsShopCheckoutPage(this.page).fillShippingInformation(email(), 'India');
});

When('I enter card details without selecting a country', async function () {
    await new LetsShopCheckoutPage(this.page).fillPaymentDetails('123', 'Test Buyer');
});

When('I attempt to place the order', async function () {
    await new LetsShopCheckoutPage(this.page).placeOrder();
});

Then('the order is not confirmed', async function () {
    await expect(this.page).toHaveURL(/#\/dashboard\/order(?:\?.*)?$/);
    await expect(this.page.getByText('Thankyou for the order.', { exact: true })).not.toBeVisible();
});

When('I enter valid card and shipping details', async function () {
    const checkoutPage = new LetsShopCheckoutPage(this.page);
    await checkoutPage.fillPaymentDetails('123', 'Test Buyer');
    await checkoutPage.fillShippingInformation(email(), 'India');
});

When('I place the order', async function () {
    const checkoutPage = new LetsShopCheckoutPage(this.page);
    await checkoutPage.placeOrder();
    await checkoutPage.validateOrderConfirmation();
    this.orderId = await checkoutPage.getOrderId();
    await this.attach(this.orderId, 'text/plain');
});

Then('the order confirmation is displayed', async function () {
    await expect(this.page.getByText('Thankyou for the order.', { exact: true })).toBeVisible();
    expect(this.orderId).toBeTruthy();
});

Given('I create an order through the website', async function () {
    await createOrder(this);
});

When('I search for the order by its ID', async function () {
    const ordersPage = new LetsShopOrdersPage(this.page);
    await ordersPage.goToOrders();
    await ordersPage.searchAndViewOrder(this.orderId);
});

Then('the order details are displayed', async function () {
    await expect(this.page).toHaveURL(new RegExp(`/order-details/${this.orderId}$`));
});

When('I delete the order by its ID', async function () {
    const ordersPage = new LetsShopOrdersPage(this.page);
    await ordersPage.goToOrders();
    await ordersPage.deleteOrder(this.orderId);
});

Then('the order deletion confirmation is displayed', async function () {
    await expect(
        this.page.getByRole('alert', { name: 'Orders Deleted Successfully' }),
    ).toContainText('Orders Deleted Successfully');
});

Given("I open the Let's Shop dashboard with a valid authentication token", async function () {
    this.authToken = await new AuthApi(this.api).login(email(), password());
    await this.page.addInitScript(token => {
        window.localStorage.setItem('token', token);
    }, this.authToken);
    await new LetsShopLoginPage(this.page).goTo();
});

Then('the dashboard is available without the login form', async function () {
    await expect(this.page).toHaveURL(/#\/dashboard/);
    await expect(this.page.locator('#products .card').first()).toBeVisible();
    await expect(this.page.getByRole('textbox', { name: 'email@example.com' })).not.toBeVisible();
});

Given("I create an order through the Let's Shop API", async function () {
    this.authToken = await new AuthApi(this.api).login(email(), password());
    this.orderId = await new OrdersApi(this.api, this.authToken).createOrder({
        country: 'India',
        productOrderedId: '6960eac0c941646b7a8b3e68',
    });
    expect(this.orderId).toBeTruthy();
    await this.page.addInitScript(token => {
        window.localStorage.setItem('token', token);
    }, this.authToken);
    await new LetsShopLoginPage(this.page).goTo();
});

When("I open the Let's Shop orders page", async function () {
    await new LetsShopOrdersPage(this.page).goToOrders();
});

Then('I can view the API-created order', async function () {
    await new LetsShopOrdersPage(this.page).searchAndViewOrder(this.orderId);
});
