const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const scrapeNotices = async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // URL to scrape
    const url = 'https://ku.edu.np/news-app?search_category=3&search_school=10&search_site_name=kuhome&show_on_home=0';
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Scraping logic
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
          image: imageElement ? imageElement.src : 'No Image'
        };
      });
    });

    // Save notices to the public folder
    const filePath = path.join(__dirname, 'public', 'notices.json');
    fs.writeFileSync(filePath, JSON.stringify(notices, null, 2));

    await browser.close();
    return { success: true, message: 'Scraping completed and data saved' };
  } catch (error) {
    console.error('Scraping failed:', error);
    return { success: false, error: 'Failed to scrape data' };
  }
};

module.exports = scrapeNotices;
