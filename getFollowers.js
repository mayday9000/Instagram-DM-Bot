const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const { google } = require('googleapis');


puppeteer.use(stealthPlugin());

const saveInfoButtonSelector = 'button._acan._acap._acas._aj1-[type="button"]';

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

    const myDict = {
        brodyfisher24: 'ΑΤΩ\nUNCC ‘26'/*,
        mas0n_dav1s: 'UNCC | ATΩ\nSnap- @mrdavis0402'*/
    }

    processProfiles(page, myDict)
    
    /*await page.goto('https://www.instagram.com/masondavisai/followers/', { waitUntil: 'networkidle2' })
    console.log("Navigating to followers page...");

    await page.waitForSelector('a[href="/masondavisai/followers/"]', { visible: true, timeout: 10_000 });
    await page.click('a[href="/masondavisai/followers/"]')
    console.log("clicked followers")

    // 3) Wait for the modal to appear
    const modal = await page.waitForSelector('div[role="dialog"]', { visible: true, timeout: 10_000 });

    // 4) Scroll the modal until it’s done loading
    let previousHeight;
    while (true) {
      const height = await page.evaluate(el => el.scrollHeight, modal);
      if (previousHeight === height) break;
      previousHeight = height;
      await page.evaluate(el => el.scrollBy(0, el.scrollHeight), modal);
      await new Promise(r => setTimeout(r, 5000));  // give it a moment to load new items
      
}*/

// …after you’ve opened & fully scrolled the modal…

const followers = await page.evaluate(() => {
    // 1. Grab the dialog
    const dialog = document.querySelector('div[role="dialog"]');
    if (!dialog) return [];
  
    // 2. Find the “Suggested for you” <h4>
    const header = Array.from(dialog.querySelectorAll('h4'))
      .find(h => h.textContent.trim() === 'Suggested for you');
  
    // 3. Get all follower <a> elements
    const anchors = Array.from(dialog.querySelectorAll('a[role="link"][href^="/"]'));
  
    // 4. If we found the header, only keep anchors that come *before* it
    const valid = header
      ? anchors.filter(a =>
          // compareDocumentPosition: does 'a' precede 'header'?
          Boolean(a.compareDocumentPosition(header) & Node.DOCUMENT_POSITION_FOLLOWING)
        )
      : anchors;
  
    // 5. From each valid <a>, pull its username <span>
    return valid
      .map(a => {
        const span = a.querySelector('span[dir="auto"]');
        return span ? span.textContent.trim() : null;
      })
      .filter(Boolean);
  });
  
  console.log(followers);  
  
  getBios(page, followers);
}

async function getBios(page, followers) {
    // assume you’re already logged in and have `followers = ['brodyfisher24','mas0n_dav1s', …]`
    const bios = {};

    for (const user of followers) {
        console.log(`Getting bio for ${user}`)
        const url = `https://www.instagram.com/${user}/`;

        // 1️⃣ go to their profile
        await page.goto(url, { waitUntil: 'networkidle2' });

        // After you’ve navigated to the profile page and header is present…

        // 1) Wait for that exact span/div structure to load
        // after you’ve navigated to their profile page…
        await page.waitForSelector('span._ap3a._aaco._aacu._aacx._aad7._aade[dir="auto"]', {
            visible: true,
            timeout: 10000
          });
          
          const bio = await page.$eval(
            'span._ap3a._aaco._aacu._aacx._aad7._aade[dir="auto"]',
            el => el.innerText.trim()
          );
          
          console.log(`→ bio for ${user}:`, bio);
          bios[user] = bio;                    
    }

    console.log(bios);

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

async function dismissNotificationModal(page) {
    try {
        const notNowSelector = 'button._a9--._ap36._a9_1';
        await page.waitForSelector(notNowSelector, { visible: true, timeout: 5000 });
        await page.click(notNowSelector);
        console.log("Clicked 'Not Now' to dismiss notification modal.");
        await new Promise(r => setTimeout(r, 500)); // let DOM settle
    } catch (err) {
        console.log("No notification modal found or already dismissed.");
    }
}

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

    // 1. Wait for the Options button to render
    await page.waitForSelector('svg[aria-label="Options"]', { visible: true, timeout: 10000 });

    // 2. Click it via its parent button container
    await page.click('svg[aria-label="Options"]');

    // 1) Wait for any button to render, just to be safe:
    await page.waitForSelector('button', { visible: true, timeout: 10000 });

    await new Promise(r => setTimeout(r, 1000));

    // 2) Use an XPath query to find the one whose text is “Send message”
    const btns = await page.$$('button');
    for (const btn of btns) {
        // get its trimmed text
        const text = await page.evaluate(el => el.textContent.trim().toLowerCase(), btn);
        if (text === 'send message') {
            return btn;             // this is your ElementHandle
        }
    }
    console.log("❌ 'Message' button not found on profile.");
    return null;
}

async function processProfiles(page, bios) {
    // bios is like { brodyfisher24: 'ΑΤΩ\nUNCC ‘26', mas0n_dav1s: 'UNCC | ATΩ\nSnap- @mrdavis0402' }
    for (const [username, bioText] of Object.entries(bios)) {
      const profileUrl = `https://www.instagram.com/${username}/`;
  
      console.log(`Navigating to profile: ${profileUrl}`);
      await page.goto(profileUrl, { waitUntil: 'networkidle2' });
  
      // 1) Check if the Message button is there
      const messageButton = await checkMessageButton(page);
      if (!messageButton) {
        console.log(`No Message button on ${username}, skipping.`);
        continue;
      }
  
      // 2) Open the DM dialog
      console.log(`Message button found on ${username}. Clicking…`);
      await messageButton.click();
  
      // 3) Send your message—e.g. include their bioText if you want
      await sendMessage(page);
      
      // 4) (Optional) wait a moment or handle the sent state
      await new Promise(r => setTimeout(r, 1000));
    }
  }  

async function main() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    require('dotenv').config();
    await loginToInstagram(page, process.env.INSTAGRAM_USER, process.env.INSTAGRAM_PASS);

    
}



main();