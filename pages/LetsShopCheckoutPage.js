const { expect } = require('@playwright/test');

class LetsShopCheckoutPage {
    /**
     * @param {import('playwright').Page} page
     */
    constructor(page) {
        this.page = page;
    }

    async validateProductInCheckout(productName) {
        const checkoutItem = this.page.locator('.item__details').filter({
            has: this.page.locator('.item__title').getByText(productName, { exact: true }),
        });

        await expect(checkoutItem).toHaveCount(1);
        await expect(checkoutItem.locator('.item__title')).toHaveText(productName);
    }

    async fillPaymentDetails(cvv, fullName) {
        const cvvInput = this.page.locator('.payment__cc .field').filter({
            hasText: 'CVV Code',
        }).locator('input');
        await cvvInput.fill(cvv);

        const nameInput = this.page.locator('.payment__cc .field').filter({
            hasText: 'Name on Card',
        }).locator('input');
        await nameInput.fill(fullName);
    }

    async fillCoupon(coupon) {
        await this.page.locator('.payment__cc input[name="coupon"]').fill(coupon);
        await this.page.locator('.payment__cc').getByRole('button', { name: 'Apply Coupon', exact: true }).click();
    }

    async placeOrder() {
        await this.page.locator('.payment__shipping a.action__submit')
            .filter({ hasText: 'Place Order' })
            .click();
    }

    async validateOrderConfirmation() {
        await expect(this.page.getByText('Thankyou for the order.', { exact: true })).toBeVisible();
    }

    async getOrderId() {
        const confirmationTable = this.page
            .locator('h1.hero-primary')
            .locator('xpath=ancestor::table[1]');
        const orderIdLabel = confirmationTable.locator('label').filter({
            hasText: /\|[^|]+\|/,
        });

        await expect(orderIdLabel).toHaveCount(1);
        const labelText = await orderIdLabel.innerText();
        const orderId = labelText.match(/\|\s*([^|]+?)\s*\|/)?.[1];

        if (!orderId) {
            throw new Error(`Could not extract order ID from confirmation label: "${labelText}"`);
        }

        return orderId;
    }

    async fillShippingInformation(expectedEmail, country) {
        const shippingSection = this.page.locator('.payment__shipping');

        await expect(shippingSection.locator('label')).toHaveText(expectedEmail);
        await shippingSection.getByPlaceholder('Select Country').pressSequentially(country);

        const countryOption = shippingSection.getByRole('button', {
            name: new RegExp(`${country.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
        });
        await expect(countryOption).toHaveCount(1);
        await countryOption.click();
    }
}

module.exports = LetsShopCheckoutPage;