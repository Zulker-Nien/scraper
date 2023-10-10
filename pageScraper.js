const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const scraperObject = {
  url: "https://onlinelibrary.wiley.com/action/doSearch?AfterMonth=&AfterYear=2015&BeforeMonth=&BeforeYear=2023&Ppub=&field1=AllField&text1=%28%22artificial+intelligence%22+OR+%22machine+learning%22+OR+%22deep+learning%22+OR+%22chatbot%22%29+AND+%28%22mental+health%22+OR+%22psychological+health%22+OR+%22psychiatric+disorders%22%29+AND+%28%22anxiety+disorders%22+OR+%22mood+disorders%22+OR+%22obsessive-compulsive+disorders%22+OR+%22eating+disorders%22+OR+%22personality+disorders%22+OR+%22neurodevelopmental+disorders%22+OR+%22post-traumatic+stress+disorders%22+OR+%22dissociative+disorders%22+OR+%22sleep+disorders%22+OR+%22neurocognitive+disorders%22+OR+%22substance-related+disorders%22+OR+%22addictive+disorders%22+OR+%22schizophrenia%22+OR+%22psychotic+disorders%22+OR+%22somatic+symptom+disorders%22+OR+%22self-harm%22%29&startPage=&PubType=journal",
  async scraper(browser) {
    let page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36"
    );
    let countNumber = 0;
    console.log(`Navigating to ${this.url}...`);
    // Navigate to the selected page
    await page.goto(this.url);
    // Wait for the required DOM to be rendered
    await page.waitForSelector(".pageHeader");

    let data = [];
    let timeoutUrls = []; // Array to store URLs that timed out

    // Function to scrape data from a page
    const scrapePage = async (link) => {
      let dataObj = {};
      let newPage = await browser.newPage();

      try {
        await newPage.goto(link, { timeout: 60000 });
        await newPage.waitForSelector(".article-citation > .citation > h1");
        console.log(countNumber++);

        // Scrape all h3 elements
        dataObj["blogTitles"] = await newPage.$eval(
          ".article-citation > .citation > h1",
          (element) => element.textContent
        );

        // Scrape all p elements
        // dataObj["blogContent"] = await newPage.$$eval(
        //   ".bbc-fa0wmp p",
        //   (elements) => elements.map((el) => el.textContent.trim())
        //   // .filter((text) => !text.startsWith("jwARI.fetch("))
        // );
      } catch (error) {
        console.error(`Error loading URL: ${link}`);
        timeoutUrls.push(link); // Add the URL to the timeoutUrls array
      } finally {
        await newPage.close();
      }
      return dataObj;
    };

    const loadMoreBlogs = async () => {
      let hasMoreButton = true;
      while (hasMoreButton) {
        const moreButton = await page.$(".e19602dz5 > span:last-child a[href]");

        if (!moreButton) {
          hasMoreButton = false;
        } else {
          const isButtonVisible = await moreButton.evaluate((button) => {
            const computedStyle = window.getComputedStyle(button);
            return computedStyle.visibility !== "hidden";
          });

          if (!isButtonVisible) {
            hasMoreButton = false;
          } else {
            try {
              await moreButton.click();
              await page.waitForTimeout(2000); // Wait for the new content to load (adjust the wait time as needed)
            } catch (error) {
              // Handle the error when the "more" button is not clickable
              hasMoreButton = false;
            }
          }
        }
      }
    };

    // Load more blogs and scrape data
    // await loadMoreBlogs();

    // Get the links to all the required blogs
    let urls = await page.evaluate(() => {
      const links = [];
      const linkElements = document.querySelectorAll(
        ".search-result__body > li > div > h2 > span a"
      );
      linkElements.forEach((el) => {
        const href = el.href;
        links.push(href);
      });
      return links;
    });

    console.log(urls);
    // Scrape data from each blog page
    for (let link of urls) {
      await page.waitForTimeout(5000);
      await page.goto(link, { timeout: 60000 });
      let currentPageData = await scrapePage(link);
      data.push(currentPageData);
    }

    // Define CSV writer and write the data to a CSV file
    const csvWriter = createCsvWriter({
      path: "scraped_data.csv",
      header: [
        { id: "blogTitles", title: "Blog Titles" },
        // { id: "blogContent", title: "Blog Content" },
      ],
    });

    csvWriter
      .writeRecords(data)
      .then(() => console.log("CSV file written successfully"))
      .catch((error) => console.error("Error writing CSV file:", error));

    // // Export timeout URLs to a separate CSV file
    // if (timeoutUrls.length > 0) {
    //   const timeoutCsvWriter = createCsvWriter({
    //     path: "timeout_urls.csv",
    //     header: [{ id: "url", title: "URL" }],
    //   });

    //   timeoutCsvWriter
    //     .writeRecords(timeoutUrls.map((url) => ({ url })))
    //     .then(() => console.log("Timeout URLs exported to timeout_urls.csv"))
    //     .catch((error) =>
    //       console.error("Error exporting timeout URLs:", error)
    // );
    // }
  },
};

module.exports = scraperObject;
