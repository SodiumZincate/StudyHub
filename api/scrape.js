const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const { MongoClient } = require('mongodb');

async function scrapeNotices() {
  try {
    console.log('Starting scraping process...');

    // Ensure Chromium is properly included
    const executablePath = await chromium.executablePath();
    console.log('Chromium executable path:', executablePath);

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: executablePath || '/usr/bin/chromium-browser', // Fallback path
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
      timeout: 30000 // 30 seconds timeout for launching Puppeteer
    });

    console.log('Puppeteer launched successfully');
    const page = await browser.newPage();
    const url = 'https://ku.edu.np/news-app?search_category=3&search_school=10&search_site_name=kuhome&show_on_home=0';
    console.log('Navigating to the URL:', url);
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 }); // Wait for the page to load, with a timeout
    console.log('Page loaded successfully');

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

    console.log(`Scraped ${notices.length} notices`);

    // Ensure MongoDB URI is provided
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MongoDB URI is missing!');
    }
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(uri, { useUnifiedTopology: true, connectTimeoutMS: 10000 });
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('studyhub');
    const collection = db.collection('notices');
    
    // Insert the scraped notices into MongoDB, limit to 100 items per insert for performance
    const chunkSize = 100;
    for (let i = 0; i < notices.length; i += chunkSize) {
      const chunk = notices.slice(i, i + chunkSize);
      await collection.insertMany(chunk);
      console.log(`Inserted ${chunk.length} notices into MongoDB`);
    }

    await browser.close();
    console.log('Browser closed successfully');
    await client.close();
    console.log('MongoDB connection closed');

    return { success: true, message: 'Scraping and storage successful' };
  } catch (error) {
    console.error('Error occurred during scraping:', error);
    return { success: false, error: error.message };
  }
}

// Run the scraping function immediately
(async () => {
  console.log('Calling scrapeNotices function...');
  const result = await scrapeNotices();
  console.log('Result:', result);
})();
