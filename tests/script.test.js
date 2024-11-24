const { test, expect } = require('@playwright/test');

const playwright = require("playwright");

test('Maxbit Assignment', async () => {
    test.setTimeout(60000); // Extend test timeout to 60 seconds

    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
        'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0'
    ];
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    const browser = await playwright["chromium"].launch({
        headless: false,
        slowMo: 2000, // Add a 2-second delay between steps for debugging
        args: [
            "--start-maximized",
            "--disable-blink-features=AutomationControlled",
            "--disable-extensions",
            "--disable-infobars",
            "--enable-automation",
            "--no-first-run",
        ],
    });

    const context = await browser.newContext({
        userAgent: randomUserAgent,
        geolocation: { longitude: 12.4924, latitude: 41.8902 },
        permissions: ["geolocation"],
        locale: "en-US",
    });

    const page = await context.newPage();
    await page.goto('https://www.ebay.com/', { timeout: 60000 });

    console.log("Typing 'tv' in the search bar...");
    const input = page.locator('input[aria-label="Search for anything"]');
    await input.type('tv', { delay: 100 });

    console.log("Clicking the search button...");
    await page.locator('//*[@id="gh-btn"]').click();

    console.log("Waiting for the first filter button...");
    const filterButton = page.locator('[aria-label="40-49 in"]');
    await filterButton.waitFor({ state: 'visible', timeout: 60000 });
    await filterButton.click();

    console.log("Selecting the first item...");
    const item1 = await page.locator('a[aria-hidden="true"][tabindex="-1"]');
    const firstItemDetails = {
        title: await page.locator('//div[contains(@class, "s-item__title")]/span').nth(3).textContent().catch(() => 'N/A'),
    };

    const [newPage1] = await Promise.all([
        page.waitForEvent('popup'),  
        await item1.nth(3).click({ force: true })
    ]);
    console.log("Adding first item to cart.");
    await newPage1.locator('a:has-text("Add to cart")').click({ force: true });

    console.log("Returning to the main page...");
    await page.bringToFront();  

    console.log("Waiting for the second filter button...");
    const filterButton2 = page.locator('[aria-label="50-59 in"]');
    await filterButton2.waitFor({ state: 'visible', timeout: 60000 });
    await filterButton2.click();

    console.log("Selecting the second item...");
    const item2 = await page.locator('a[aria-hidden="true"][tabindex="-1"]');
    const secondItemDetails = {
        title: await page.locator('//div[contains(@class, "s-item__title")]/span').nth(4).textContent().catch(() => 'N/A'),
    };

    const [newPage2] = await Promise.all([
        page.waitForEvent('popup'),  
        await item2.nth(4).click({ force: true })
    ]);
    await newPage2.locator('a:has-text("Add to cart")').click({ force: true });

    console.log("Returning to the main page...");
    await page.bringToFront();  

    console.log("Clicking the cart icon...");
    const cartIcon = page.locator('.gh-cart-icon').nth(1); 
    await cartIcon.waitFor({ state: 'visible', timeout: 60000 });
    await cartIcon.click({ force: true });

    console.log("Validating items in the cart...");
    const cartItems = await page.locator('.cart-bucket-lineitem').allInnerTexts();
    const isItem1Match = cartItems.some(cartItem =>
        cartItem.includes(firstItemDetails.title)
    );
    const isItem2Match = cartItems.some(cartItem =>
        cartItem.includes(secondItemDetails.title)
    );

    console.log('Item 1 Info:', firstItemDetails);
    console.log('Item 2 Info:', secondItemDetails);
    console.log('Cart Items:', cartItems);

    if (isItem1Match && isItem2Match) {
        console.log('Validation successful: All items are in the cart.');
    } else {
        console.error('Validation failed: Cart does not match the items added.');
    }
    // Uncomment to close the browser after test execution
    // await browser.close();
});