const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const { google } = require('googleapis');

puppeteer.use(stealthPlugin());

const saveInfoButtonSelector = 'button._acan._acap._acas._aj1-[type="button"]';


var profiles = [
    'https://www.instagram.com/tomferry/',
    'https://www.instagram.com/anthony_the_dreamer92/',
    'https://www.instagram.com/lifeasrob/',
    'https://www.instagram.com/a.whitaker228/',
    'https://www.instagram.com/cousineaurealestate/'/*,
    'https://www.instagram.com/jamesagreenrealestate/'*/
]

async function checkMessageButton(page) {
    const buttonSelector = 'div[role="button"][tabindex="0"]';
    const buttons = await page.$$(buttonSelector);

    for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent.trim().toLowerCase(), btn);
        if (text === 'message') {
            console.log("✅ 'Message' button found on profile.");
            return btn;
        }
    }

    console.log("❌ 'Message' button not found on profile.");
    return null;
}


async function loginToInstagram(page, username, password) {
    console.log("Navigating to Instagram login page...");
    await page.goto('https://www.instagram.com/accounts/login/');
    
    await new Promise(r => setTimeout(r, 5000));  // Wait for the login page to load properly

    console.log("Typing email...");
    await page.type('input[aria-label="Phone number, username, or email"]', username);
    
    console.log("Typing password...");
    await page.type('input[aria-label="Password"]', password);

    console.log("Clicking login...");
    await page.click('button[type="submit"]');

    await new Promise(r => setTimeout(r, 10000));  // Wait for the redirection after login

    // Check if the login was successful
    try {
        await page.waitForSelector(saveInfoButtonSelector, { timeout: 10000 });
        console.log("Login successful!");
    } catch (e) {
        console.error("Login failed or it took too long to load the next page.");
        throw e; // Propagate the error
    }
}

async function navigateToProfileAndCheckMessageButton(page, rowNumber) {
    const profileLink = profiles[rowNumber]
    if (!profileLink) {
        console.error("No more profiles left to navigate to.");
        return;
    }

    console.log(`Navigating to profile: ${profileLink}`);
    await page.goto(profileLink, { waitUntil: 'networkidle2' });

    const messageButton = await checkMessageButton(page);

    if (messageButton) {
        console.log("Message button found on the profile. Clicking...");
        await messageButton.click();
        await sendMessage(page)
    } else {
        console.log("Message button not found on the profile. Navigating to the next profile...");
    }

    //Next step would be to write and send message
}

async function dismissNotificationModal(page) {
    try {
        const notNowSelector = 'button._a9--._ap36._a9_1';
        await page.waitForSelector(notNowSelector, { visible: true, timeout: 5000 });
        await page.click(notNowSelector);
        console.log("Clicked 'Not Now' to dismiss notification modal.");
        await page.waitForTimeout(500); // let DOM settle
    } catch (err) {
        console.log("No notification modal found or already dismissed.");
    }
}

async function sendMessage(page){
    //implement this :)
    await page.waitForSelector('div.xzsf02u.x1a2a7pz.x1n2onr6.x14wi4xw.x1iyjqo2.x1gh3ibb.xisnujt.xeuugli.x1odjw0f.notranslate', { visible: true });
    await page.type('div.xzsf02u.x1a2a7pz.x1n2onr6.x14wi4xw.x1iyjqo2.x1gh3ibb.xisnujt.xeuugli.x1odjw0f.notranslate', 'hi');

    await dismissNotificationModal(page);

    const buttons = await page.$$('div[role="button"][tabindex="0"]');
for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.trim().toLowerCase() === 'send') {
        await btn.click();
        console.log("sent");
        break;
    }
}

}

async function main() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    require('dotenv').config();
    await loginToInstagram(page, process.env.INSTAGRAM_USER, process.env.INSTAGRAM_PASS);

    for(i=0; i < profiles.length; i++){
        await navigateToProfileAndCheckMessageButton(page, i);
    }
    
}

main();