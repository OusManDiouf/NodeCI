const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
})

afterEach(async () => {
  await page.close();
})

describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login()
    await page.click('a.btn-floating')
  });

  test('should see the blog create form', async () => {

    const label = await page.getContentOf('form label');

    expect(label).toEqual('Blog Title');
  });

  describe('And using valid input', async () => {

    beforeEach(async () => {
      await page.type('.title input', 'My Title')
      await page.type('.content input', 'My Content')
      await page.click('form button');
    })

    test('Submitting takes user to review screen', async () => {
      const text = await page.getContentOf('h5');
      expect(text).toEqual('Please confirm your entries');
    });

    test('Submitting then saving adds blog to index page', async () => {
      await page.click('button.green');
      await page.waitFor('.card');

      const title = await page.getContentOf('.card-title');
      const content = await page.getContentOf('p');

      expect(title).toEqual('My Title');
      expect(content).toEqual('My Content');
    });

  });


  describe('And using invalid inputs', async () => {

    beforeEach(async () => {
      await page.click('form button');
    })

    test('should make the form shaw an error ', async () => {
      const titleError = await page.getContentOf('.title .red-text')
      const contentError = await page.getContentOf('.content .red-text')

      expect(titleError).toEqual('You must provide a value')
      expect(contentError).toEqual('You must provide a value')
    });
  });

});


describe('When user is not logged in', async () => {

  test('User cannot create blog posts', async () => {

    const result = await page.evaluate(() => {

      return fetch('/api/blogs', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          title: 'My Title',
          content: 'My Content'
        })
      }).then(res => res.json());

    });

    expect(result).toEqual({error: 'You must log in!'})
  });

  test('User cannot get a list of posts', async () => {

    const result = await page.evaluate(() => {

      return fetch('/api/blogs', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-type': 'application/json',
        },
      }).then(res => res.json());

    });

    expect(result).toEqual({error: 'You must log in!'})
    
  });

});