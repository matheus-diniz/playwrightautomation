const BASE_URL = 'https://rahulshettyacademy.com/api/ecom';

class OrdersApi {
    constructor(apiContext) {
        this.apiContext = apiContext;
    }

    async createOrder(authToken, order) {
        const response = await this.apiContext.post(`${BASE_URL}/order/create-order`, {
            data: {
                orders: [order],
            },
            headers: {
                Authorization: authToken,
            },
        });

        if (!response.ok()) {
            throw new Error(`Create order API failed with status ${response.status()}: ${await response.text()}`);
        }

        const responseBody = await response.json();
        const orderId = responseBody.orders?.[0];
        if (!orderId) {
            throw new Error('Create order API response did not include an order ID.');
        }

        return orderId;
    }
}

module.exports = OrdersApi;