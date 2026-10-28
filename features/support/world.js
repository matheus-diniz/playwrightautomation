const {
    After,
    AfterAll,
    Before,
    BeforeAll,
    setDefaultTimeout,
    setWorldConstructor,
} = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const dotenv = require('dotenv');
const path = require('path');
const { randomUUID } = require('crypto');
const { readFile, rm } = require('fs/promises');
const { tmpdir } = require('os');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
setDefaultTimeout(60_000);

let browser;

class CustomWorld {
    constructor({ attach }) {
        this.attach = attach;
        this.browser = undefined;
        this.context = undefined;
        this.page = undefined;
        this.api = undefined;
        this.traceStarted = false;
        this.eventHubUser = undefined;
        this.eventHubEvent = undefined;
        this.orderId = undefined;
        this.authToken = undefined;
    }
}

setWorldConstructor(CustomWorld);

BeforeAll(async function () {
    browser = await chromium.launch({ headless: true });
});

Before(async function () {
    this.browser = browser;
    this.context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
    });
    await this.context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true,
    });
    this.traceStarted = true;
    this.page = await this.context.newPage();
    this.api = this.context.request;
});

After(async function (scenario) {
    const failed = scenario.result?.status === 'FAILED';
    try {
        if (this.traceStarted) {
            if (failed) {
                const tracePath = path.join(tmpdir(), `playwright-trace-${randomUUID()}.zip`);
                try {
                    await this.context.tracing.stop({ path: tracePath });
                    this.traceStarted = false;
                    await this.attach(await readFile(tracePath), 'application/zip');
                } finally {
                    await rm(tracePath, { force: true });
                }
                if (this.page) {
                    await this.attach(await this.page.screenshot(), 'image/png');
                }
            } else {
                await this.context.tracing.stop();
                this.traceStarted = false;
            }
        }

        if (this.eventHubEvent && this.eventHubToken) {
            const response = await this.api.delete(
                `https://api.eventhub.rahulshettyacademy.com/api/events/${this.eventHubEvent.id}`,
                { headers: { Authorization: `Bearer ${this.eventHubToken}` } },
            );
            if (!response.ok()) {
                throw new Error(
                    `EventHub test event cleanup failed with status ${response.status()}: ${await response.text()}`,
                );
            }
        }
    } finally {
        await this.context?.close();
    }
});

AfterAll(async function () {
    await browser?.close();
});
