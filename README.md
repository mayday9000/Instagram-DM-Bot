# Instagram-DM-Bot
This project contains two Puppeteer-based automation scripts for Instagram:

getFollowers.js – Logs into Instagram, retrieves followers of specified accounts, optionally extracts their bios, and can send direct messages to them.

massDM.js – Logs into Instagram and sends direct messages to a predefined list of profile URLs.

Both scripts use the puppeteer-extra Stealth plugin to reduce detection risk.

Disclaimer
Automating interactions with Instagram violates their Terms of Service.
This code is for educational/testing purposes only. Use only on accounts you own or have explicit permission to access. Running it on real accounts can lead to bans or legal issues.

Features
getFollowers.js

Logs into Instagram with credentials from environment variables.

Navigates to a target account’s followers list.

Scrolls through and collects follower usernames.

Visits each profile to extract bio text.

Optionally sends messages to collected users.

massDM.js

Logs into Instagram with credentials from environment variables.

Visits each profile in a predefined array.

Checks for a “Message” button.

Opens the DM window and sends a preset message.

Requirements
Node.js 18+

Instagram account (test account recommended)

NPM or Yarn

Installation
Clone this repository.

Run:
npm install
Configuration
Create a .env file in the project root:
INSTAGRAM_USER=your_username
INSTAGRAM_PASS=your_password
Note: .env is ignored by Git to protect credentials.

Usage
Run followers fetcher:
npm start
(Runs getFollowers.js by default)

Run mass DM script:
node massDM.js
Project Structure
.
├── getFollowers.js     # Fetch followers, bios, and optionally send DMs
├── massDM.js           # Send DMs to a predefined list of profiles
├── package.json
├── package-lock.json
└── .env                # Not committed, stores credentials
Dependencies
puppeteer

puppeteer-extra

puppeteer-extra-plugin-stealth

googleapis

Recommendations
Randomize delays to mimic human behavior.

Add retries for failed navigation or message sends.

Use headless: true for background operation, false for debugging.
