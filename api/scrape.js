const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const { MongoClient } = require('mongodb');

module.exports = async function scrapeNotices() {
  try {
    // Ensure Chromium is properly included
    const executablePath = await chromium.executablePath();
    
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: executablePath || '/usr/bin/chromium-browser', // Fallback
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    const url = 'https://ku.edu.np/news-app?search_category=3&search_school=10&search_site_name=kuhome&show_on_home=0';
    
    await page.goto(url, { waitUntil: 'networkidle2' });

    const notices = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.primary-box.bg-white')).map(notice => {
        const titleElement = notice.querySelector('.primary-box__title.listing-primary-box-title');
        const descriptionElement = notice.querySelector('.primary-box__text.d-none.d-sm-block.js-desc');
        const dateElement = notice.querySelector('.primary-box__text.my-0.h-auto.f-14');
        const linkElement = notice.querySelector('.my-a');
        const imageElement = notice.querySelector('.news-wrap-item-img img');

        return {
          title: titleElement ? titleElement.innerText.trim() : 'No Title',
          description: descriptionElement ? descriptionElement.innerText.trim() : 'No Description',
          date: dateElement ? dateElement.innerText.trim() : 'No Date',
          link: linkElement ? linkElement.href : 'No Link',
          image: imageElement ? imageElement.src : 'No Image',
        };
      });
    });

    // Store scraped data in MongoDB
    const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    await client.connect();
    const db = client.db('studyhub');
    const collection = db.collection('notices');
    
    // Insert the scraped notices into MongoDB
    await collection.insertMany(notices);

    await browser.close();

    // Return a result for the API route
    return { success: true, message: 'Scraping and storage successful' };
  } catch (error) {
    console.error('Error occurred during scraping:', error);
    return { success: false, error: error.message };
  }
};
