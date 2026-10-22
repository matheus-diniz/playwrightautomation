const BASE_URL = 'https://rahulshettyacademy.com/api/ecom';

class OrdersApi {
    constructor(apiContext, authToken) {
        this.apiContext = apiContext;
        this.authToken = authToken;
    }

    async createOrder(order) {
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

        const responseBody = await response.json();
        const orderId = responseBody.orders?.[0];
        if (!orderId) {
            throw new Error('Create order API response did not include an order ID.');
        }

        return orderId;
    }
}

module.exports = OrdersApi;