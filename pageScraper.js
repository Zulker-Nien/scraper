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
    console.log(urls);
  },
};

module.exports = scraperObject;
// let pagePromise = (link) =>
//   new Promise(async (resolve, reject) => {
//     let dataObj = {};
//     let newPage = await browser.newPage();
//     await newPage.goto(link);
//     dataObj["blogTitle"] = await newPage.$eval(
//       ".story-title-info > h1",
//       (text) => text.textContent
//     );
//     dataObj["blogContent"] = await newPage.$eval(
//       ".story-title-info > h1",
//       (text) => text.textContent
//     );
//     resolve(dataObj);
//     await newPage.close();
//   });

// for (link in urls) {
//   let currentPageData = await pagePromise(urls[link]);
//   // scrapedData.push(currentPageData);
//   console.log(currentPageData);
// }
