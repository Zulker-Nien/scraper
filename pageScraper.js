const scraperObject = {
  url: "https://www.prothomalo.com/lifestyle/health",
  async scraper(browser) {
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    // Navigate to the selected page
    await page.goto(this.url);
    // Wait for the required DOM to be rendered
    await page.waitForSelector(".header");
    // Get the link to all the required books
    let urls = await page.evaluate(() => {
      const links = [];
      const linkElements = document.querySelectorAll(".stories-set a");
      linkElements.forEach((el) => {
        links.push(el.href);
      });
      return links;
    });
    let pagePromise = (link) =>
      new Promise(async (resolve, reject) => {
        let dataObj = {};
        let newPage = await browser.newPage();
        await newPage.goto(link);

        // Scrape all h1 elements
        dataObj["blogTitles"] = await newPage.$$eval(
          ".story-grid div > h1",
          (elements) => elements.map((el) => el.textContent)
        );

        // Scrape all p elements
        dataObj["blogContent"] = await newPage.$$eval(
          ".story-grid div > p",
          (elements) => elements.map((el) => el.textContent)
        );

        resolve(dataObj);
        await newPage.close();
      });

    for (link in urls) {
      let currentPageData = await pagePromise(urls[link]);
      console.log(currentPageData);
    }
  },
};

module.exports = scraperObject;
