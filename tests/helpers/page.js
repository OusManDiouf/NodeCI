const puppeteer = require('puppeteer');
const sessionFactory = require('../../tests/factories/sessionFactory')
const userFactory = require('../../tests/factories/userFactory')

class CustomPage {

  static async build(){

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: "/usr/bin/google-chrome",
      args:['--no-sandbox']
    });

    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage,{
      get: function(target, prop){
        // La méthode close() existe sur le browser et la page, on veut celui de l'objet dans l'appel dans le header.test
        return customPage[prop] || browser[prop] || page[prop] ; // the order matter !!!
      }
    })
  }

  constructor(page) {
    this.page = page;
  }

   async login(){

    const user = await userFactory();
    const {session, sig } = sessionFactory(user);
    // test that it match the cookiein the browser on the response to the url /auth/google/callback
    // console.log(session);
    // console.log(sig);
    
    // set the cookies on the page 
    await this.page.setCookie({name: 'session',value : session, domain: ''})
    await this.page.setCookie({name: 'session.sig',value : sig, domain:''})
    // need a refresh to simulate the login flow but in the blogs page for the purpose of the blog test
    await this.page.goto('http://localhost:3000/blogs')
    
    //wainting until the page rendering is done and...
    await this.page.waitFor('a[href="/auth/logout"]');

  }

  async getContentOf(selector){
    return this.page.$eval(selector, (el) => el.innerHTML);
  }
}

module.exports = CustomPage;