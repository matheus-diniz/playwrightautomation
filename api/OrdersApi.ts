import type { APIRequestContext } from '@playwright/test';

const BASE_URL = 'https://rahulshettyacademy.com/api/ecom';

type OrderToCreate = {
    country: string;
    productOrderedId: string;
};

class OrdersApi {
    private readonly apiContext: APIRequestContext;
    private readonly authToken: string;

    constructor(apiContext: APIRequestContext, authToken: string) {
        this.apiContext = apiContext;
        this.authToken = authToken;
    }

    async createOrder(order: OrderToCreate): Promise<string> {
        const response = await this.apiContext.post(`${BASE_URL}/order/create-order`, {
            data: {
                orders: [order],
            },
            headers: {
                Authorization: this.authToken,
            },
        });

        if (!response.ok()) {
            throw new Error(`Create order API failed with status ${response.status()}: ${await response.text()}`);
        }

        const responseBody: unknown = await response.json();
        if (
            typeof responseBody !== 'object' ||
            responseBody === null ||
            !('orders' in responseBody) ||
            !Array.isArray(responseBody.orders)
        ) {
            throw new Error('Create order API response did not include an order ID.');
        }

        const orderId: unknown = responseBody.orders[0];
        if (typeof orderId !== 'string' || !orderId) {
            throw new Error('Create order API response did not include an order ID.');
        }

        return orderId;
    }
}

module.exports = OrdersApi;
