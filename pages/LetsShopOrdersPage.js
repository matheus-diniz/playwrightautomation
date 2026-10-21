const { expect } = require('@playwright/test');

class LetsShopOrdersPage {
    /**
     * @param {import('playwright').Page} page
     */
    constructor(page) {
        this.page = page;
    }

    async goToOrders() {
        await this.page.getByRole('button', { name: /ORDERS/ }).click();
        await expect(this.page).toHaveURL(/#\/dashboard\/myorders/);
    }

    async searchAndViewOrder(orderId) {
        const orderRow = this.getOrderRow(orderId);

        await expect(orderRow).toHaveCount(1);
        await orderRow.getByRole('button', { name: 'View', exact: true }).click();
        await this.page.waitForLoadState('networkidle');
        await expect(this.page).toHaveURL(new RegExp(`/order-details/${orderId}$`));
    }

    async deleteOrder(orderId) {
        const orderRow = this.getOrderRow(orderId);

        await expect(orderRow).toHaveCount(1);
        await orderRow.getByRole('button', { name: 'Delete', exact: true }).click();
        await expect(
            this.page.getByRole('alert', { name: 'Orders Deleted Successfully' })
        ).toContainText('Orders Deleted Successfully');
    }

    getOrderRow(orderId) {
        return this.page.locator('table tbody tr').filter({
            has: this.page.locator('th[scope="row"]').getByText(orderId, { exact: true }),
        });
    }

}

module.exports = LetsShopOrdersPage;