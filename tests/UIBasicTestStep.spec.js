const { test, expect } = require('@playwright/test');

const invalidUser = { username: 'matheus', password: 'password', type: 'User', role: 'Consultant' };
const validUser = { username: 'rahulshettyacademy', password: 'Learning@830$3mK2', type: 'Admin', role: 'Student' };
/* test('First Playwright Test', async ({ page }) => {

    await page.goto("https://rahulshettyacademy.com/loginpagePractise/");

    await expect(page).toHaveTitle(/LoginPage Practise/i);

});*/

test.beforeEach(async ({ page }) => {
    await page.goto('https://rahulshettyacademy.com/loginpagePractise/');
    await expect(page).toHaveTitle(/LoginPage Practise/i);
});


test('rejeitar login com credenciais inválidas', async ({ page }) => {
    await login(page, invalidUser);
    await expect(page.getByText(/Incorrect username\/password/i)).toBeVisible();
});

test('aceita credenciais válidas', async ({ page }) => {
    await login(page, validUser);
    await expect(page).toHaveTitle(/ProtoCommerce/i);
    await expect(page.getByRole('heading', { name: 'Shop Name' })).toBeVisible();
});

async function login(page, user) {
    await page.getByRole('textbox', { name: 'Username:' }).fill(user.username);
    await page.getByRole('textbox', { name: 'Password:' }).fill(user.password);

    await selectUserType(page, user.type);
    await selectRole(page, user.role);

    await validateTermsCheckbox(page);
    await page.getByRole('button', { name: 'Sign In' }).click();
}

async function selectUserType(page, type) {
    if (type !== 'User' && type !== 'Admin') {
        throw new Error(`Tipo de usuário inválido: ${type}`);
    }

    if (type === 'User') {
        await page.getByRole('radio', { name: 'User' }).check();
        await expect(page.getByText('You will be limited to only')).toBeVisible();
        await page.getByRole('button', { name: 'Okay' }).click();
        await expect(page.getByRole('radio', { name: 'User' })).toBeChecked();
    }
}

async function selectRole(page, role) {
    await page.getByRole('combobox').selectOption({ label: role });
}

async function validateTermsCheckbox(page) {
    const termsCheckbox = page.getByRole('checkbox', { name: /I Agree to the terms/i });

    if (!(await termsCheckbox.isChecked())) {
        await termsCheckbox.check();
    }
    
    await expect(termsCheckbox).toBeChecked();
}
