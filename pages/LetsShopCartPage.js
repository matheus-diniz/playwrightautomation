const { expect } = require('@playwright/test');

class LetsShopCartPage {
    /**
     * @param {import('playwright').Page} page
     */
    constructor(page) {
        this.page = page;
    }

    async goToCart() {
        await this.page.getByRole('button', { name: '   Cart' }).click();
    }

    async validateProduct(productName) {
        const cartItems = this.page.locator('li.items').filter({
            has: this.page.getByRole('heading', { name: productName, exact: true }),
        });

        await expect(cartItems.first().locator('h3')).toHaveText(productName);
    }

    async removeProduct(productName) {
        const cartItem = this.page.locator('li.items').filter({
            has: this.page.getByRole('heading', { name: productName, exact: true }),
        });

        await expect(cartItem).toHaveCount(1);

        const removeButton = cartItem.locator('.removeWrap button.btn-danger');
        await expect(removeButton).toHaveCount(1);
        await removeButton.click();
    }

    async validateProductNotInCart(productName) {
        const cartItems = this.page.locator('li.items').filter({
            has: this.page.getByRole('heading', { name: productName, exact: true }),
        });

        await expect(cartItems).toHaveCount(0);
    }

    async proceedToCheckout() {
        await this.page.getByRole('button', { name: 'Checkout' }).click();
    }
}

module.exports = LetsShopCartPage;
