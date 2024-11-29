import * as api from '../src/api/api';
const HOST = "http://localhost:3000";//api.settings.hostFE;

const { test, expect } = require('@playwright/test');



test('Verify "All Books" link is visible', async ({ page }) => {
  await page.goto(HOST);

  await page.waitForSelector('nav.navbar');

  const allBooksLink = await page.$('a[href="/catalog"]');

  const isLinkVisible = await allBooksLink.isVisible();
  expect(isLinkVisible).toBe(true);
});

test('Verify "Login" button is visible', async ({ page }) => {
  await page.goto(HOST);

  await page.waitForSelector('nav.navbar');

  const loginButton = await page.$('a[href="/login"]');

  const isLoginButtonVisible = await loginButton.isVisible();

  expect(isLoginButtonVisible).toBe(true);
});

test('Verify "All Books" link is visible after user login', async ({ page }) => {
  await page.goto(HOST + '/login');

  await page.fill('input[name="email"]', 'peter@abv.bg');
  await page.fill('input[name="password"]', '123456');
  await page.click('input[type="submit"]');

  const allBooksLink = await page.$('a[href="/catalog"]');
  const isAllBooksLinkVisible = await allBooksLink.isVisible();

  expect(isAllBooksLinkVisible).toBe(true);
});

test('Login with valid credentials', async ({ page }) => {
  await page.goto(HOST + '/login');

  await page.fill('input[name="email"]', 'peter@abv.bg');
  await page.fill('input[name="password"]', '123456');

  await page.click('input[type="submit"]');

  await page.$('a[href="/catalog"]');
  expect(page.url()).toBe(HOST + '/catalog');
});

test('Login with empty input fields', async ({ page }) => {
  await page.goto(HOST + '/login');
  await page.click('input[type="submit"]');

  page.on('dialog', async dialog => {
      expect(dialog.type()).toContain('alert');   
      expect(dialog.message()).toContain('All fields are required!');
      await dialog.accept();
    });

    await page.$('a[href="/login"]');
    expect(page.url()).toBe(HOST + '/login');
});

test('Add book with correct data', async ({ page }) => {
  await page.goto(HOST + '/login');

  await page.fill('input[name="email"]', 'peter@abv.bg');
  await page.fill('input[name="password"]', '123456');

  await Promise.all([
    page.click('input[type="submit"]'), 
    page.waitForURL(HOST + '/catalog')
  ]);

  await page.click('a[href="/create"]');

  await page.waitForSelector('#create-form');

  await page.fill('#title', 'Test Book');
  await page.fill('#description', 'This is a test book description');
  await page.fill('#image', 'https://example.com/book-image.jpg');
  await page.selectOption('#type', 'Fiction');

  await page.click('#create-form input[type="submit"]');

  await page.waitForURL(HOST + '/catalog');

  expect(page.url()).toBe(HOST + '/catalog');
});

test('Add book with empty title field', async ({ page }) => {
  await page.goto(HOST + '/login');

  await page.fill('input[name="email"]', 'peter@abv.bg');
  await page.fill('input[name="password"]', '123456');

  await Promise.all([
    page.click('input[type="submit"]'), 
    page.waitForURL(HOST + '/catalog')
  ]);

  await page.click('a[href="/create"]');

  await page.waitForSelector('#create-form');

  await page.fill('#description', 'This is a test book description');
  await page.fill('#image', 'https://example.com/book-image.jpg');
  await page.selectOption('#type', 'Fiction');

  await page.click('#create-form input[type="submit"]');

  page.on('dialog', async dialog => {
    expect(dialog.type()).toContain('alert');   
    expect(dialog.message()).toContain('All fields are required!');
    await dialog.accept();
  });

  await page.$('a[href="/create"]');
  expect(page.url()).toBe(HOST + '/create');
});

test('Login and verify all books are displayed', async ({ page }) => {
  await page.goto(HOST +'/login');

  await page.fill('input[name="email"]', 'peter@abv.bg');
  await page.fill('input[name="password"]', '123456');

  await Promise.all([
    page.click('input[type="submit"]'), 
    page.waitForURL(HOST + '/catalog') 
  ]);

  await page.waitForSelector('.dashboard');

  const bookElements = await page.$$('.other-books-list li');

  expect(bookElements.length).toBeGreaterThan(0);
});

test('Login and navigate to Details page', async ({ page }) => {
  await page.goto(HOST +'/login');

  await page.fill('input[name="email"]', 'peter@abv.bg');
  await page.fill('input[name="password"]', '123456');

  await Promise.all([
    page.click('input[type="submit"]'), 
    page.waitForURL(HOST + '/catalog')
  ]);

  await page.click('a[href="/catalog"]');

  await page.waitForSelector('.otherBooks');

  await page.click('.otherBooks a.button');

  await page.waitForSelector('.book-information');

  const detailsPageTitle = await page.textContent('.book-information h3');
  expect(detailsPageTitle).toBe('Test Book'); 
});

test('Verify visibility of Logout button after user login', async ({ page }) => {
  await page.goto(HOST +'/login');

  await page.fill('input[name="email"]', 'peter@abv.bg');
  await page.fill('input[name="password"]', '123456');
  await page.click('input[type="submit"]');

  const logoutLink = await page.$('a[href="javascript:void(0)"]');

  const isLogoutLinkVisible = await logoutLink.isVisible();

  expect(isLogoutLinkVisible).toBe(true);
});

test('Verify redirection of Logout link after user login', async ({ page }) => {
  await page.goto(HOST +'/login');

  await page.fill('input[name="email"]', 'peter@abv.bg');
  await page.fill('input[name="password"]', '123456');
  await page.click('input[type="submit"]');

  const logoutLink = await page.$('a[href="javascript:void(0)"]');
  await logoutLink.click();

  const redirectedURL = page.url();
  expect(redirectedURL).toBe(HOST + '/catalog');
});