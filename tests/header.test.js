const Page = require('./helpers/page');


let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
})

//comment this to see the ui (don't forget to set headless prop in page.js to false)
afterEach(async() => {
  await page.close();
})


test('The header has the correct text',async () => {
  const text = await page.getContentOf('a.brand-logo');
  expect(text).toEqual('Blogster');
});

test('Clicking login starts Oauth flow', async() => {
  await page.click('.right a');
  const pageUrl = await page.url();
  expect(pageUrl).toMatch('/accounts\.google\.com/');
})

test('When signed in, shows a logout boutton', async () => {
    await page.login();
    // ... do the test.
    const text = await page.$eval('a[href="/auth/logout"]',  (el) => el.innerHTML)
    expect(text).toEqual('Logout');
});