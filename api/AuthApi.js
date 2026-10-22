const BASE_URL = 'https://rahulshettyacademy.com/api/ecom';

class AuthApi {
    constructor(apiContext) {
        this.apiContext = apiContext;
    }

    async login(email, password) {
        const response = await this.apiContext.post(`${BASE_URL}/auth/login`, {
            data: {
                userEmail: email,
                userPassword: password,
            },
        });

        if (!response.ok()) {
            throw new Error(`Authentication API failed with status ${response.status()}: ${await response.text()}`);
        }

        const responseBody = await response.json();
        if (!responseBody.token) {
            throw new Error('Authentication API response did not include a token.');
        }

        return responseBody.token;
    }
}

module.exports = AuthApi;