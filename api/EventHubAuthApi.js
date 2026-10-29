const BASE_URL = 'https://api.eventhub.rahulshettyacademy.com/api';

class EventHubAuthApi {
    constructor(apiContext) {
        this.apiContext = apiContext;
    }

    static requiredCredential(name) {
        const value = process.env[name];
        if (!value) {
            throw new Error(`DATA NOT FOUND: Please set ${name} in environment variables.`);
        }
        return value;
    }

    async register(user) {
        const response = await this.apiContext.post(`${BASE_URL}/auth/register`, {
            data: user,
        });

        if (!response.ok()) {
            throw new Error(
                `EventHub registration failed with status ${response.status()}: ${await response.text()}`,
            );
        }

        return response.json();
    }

    async login(email, password) {
        const response = await this.apiContext.post(`${BASE_URL}/auth/login`, {
            data: { email, password },
        });

        if (!response.ok()) {
            throw new Error(
                `EventHub authentication failed with status ${response.status()}: ${await response.text()}`,
            );
        }

        const body = await response.json();
        if (!body.token) {
            throw new Error('EventHub authentication response did not include a token.');
        }

        return body.token;
    }
}

module.exports = EventHubAuthApi;
