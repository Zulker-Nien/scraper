const scraperObject = {
  url: "https://www.prothomalo.com/lifestyle/health",
  async scraper(browser) {
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    // Navigate to the selected page
    await page.goto(this.url);
    // Wait for the required DOM to be rendered
    await page.waitForSelector(".page_inner");
    // Get the link to all the required books
    let urls = await page.$$eval(".stories-set", (links) => {
      // Extract the links from the data
      links = links.map((el) => el.querySelector(".news-with-item > a").href);
      return links;
    });
    console.log(urls);
  },
};

module.exports = scraperObject;
