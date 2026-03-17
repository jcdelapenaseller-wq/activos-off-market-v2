const puppeteer = require('puppeteer');

async function inspectPagination() {
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  // Navigate to main page
  await page.goto('https://subastas.boe.es/index.php?ver=1', { waitUntil: 'networkidle2' });
  
  // Select Madrid (value 28)
  await page.select('select', '28');
  await page.click('input[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  
  console.log('Current URL:', page.url());
  
  // Print all links to see what we have
  const pageContent = await page.evaluate(() => {
    return document.body.innerHTML;
  });
  
  console.log('Page content length:', pageContent.length);
  
  // Look for pagination container and "Siguiente" link
  const result = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    const page2Link = links.find(a => a.innerText.trim() === '2');
    const nextLink = links.find(a => a.innerText.includes('Siguiente'));
    
    let container = null;
    if (page2Link) {
        // Walk up to find a reasonable container
        container = page2Link.parentElement;
        while (container && container.tagName !== 'UL' && container.tagName !== 'DIV' && container.tagName !== 'NAV') {
            container = container.parentElement;
        }
    }
    
    return {
        containerHTML: container ? container.outerHTML : 'Container not found',
        siguienteHTML: nextLink ? nextLink.outerHTML : 'Not found'
    };
  });
  
  console.log('Pagination result:', JSON.stringify(result, null, 2));
  
  await browser.close();
}

inspectPagination();
