#!/usr/bin/env node

const pkg = require('./package.json');
const puppeteer = require('puppeteer');
const signale = require('signale');
const ora = require('ora');
const args = require('args-parser')(process.argv);

(async () => {
  let spinner;
  try {
    signale.start(`html2image v${pkg.version}`);

    if (!args.url) {
      return signale.error('No url arg provided');
    }
    if (!args.dest) {
      return signale.error('No dest arg provided');
    }
    if (!args.width) {
      args.width = 800;
    }
    if (!args.width) {
      args.height = 600;
    }
    spinner = ora('Starting puoppeteer browser').start();
    const browser = await puppeteer.launch({
      headless: true,
      slowMo: 300,
      defaultViewport: {
        width: args.width,
        height: args.height
      }
    });
    const page = await browser.newPage();
    if (args['cookie-name']) {
      await page.setCookie({name: args['cookie-name'], value: args['cookie-value'], domain: args['cookie-domain']});
    }
    spinner.succeed();
    spinner = ora('Loading page').start();
    await page.goto(args.url, {waitUntil: 'domcontentloaded'});
    await page.waitForSelector('body');
    spinner.succeed();
    spinner = ora('Taking screenshot').start();
    await page.screenshot({
      type: 'jpeg',
      path: args.dest,
      fullPage: false,
    });
    await browser.close();
    spinner.succeed();
  } catch (err) {
    if (spinner) {
      spinner.stop();
    }
    signale.error(err);
    process.exit();
  }
})();