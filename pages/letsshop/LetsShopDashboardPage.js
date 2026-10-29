const { expect } = require('@playwright/test');

class LetsShopDashboardPage {

        /**
     * @param {import('playwright').Page} page
     */
    constructor(page) {
        this.page = page;
    }


    async addProductToCart(productName) {
        const productCard = this.page.locator('#products .card').filter({
            has: this.page.getByRole('heading', { name: productName, exact: true }),
        });

        await expect(productCard).toHaveCount(1);
        const addToCartButton = productCard.locator('button').filter({ hasText: 'Add To Cart' });

        await expect(addToCartButton).toHaveCount(1);
        await addToCartButton.click();
    }

}

module.exports = LetsShopDashboardPage;