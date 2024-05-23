#!/usr/bin/env node

const path = require('node:path');
const fs = require('node:fs');
const urlParser = require('node:url');

const pkg = require('./package.json');

const puppeteer = require('puppeteer');
const signale = require('signale');
const ora = require('ora');
const argsParser = require('args-parser');
const express = require('express');

(async () => {
  let spinner;
  try {
    signale.start(`html2image v${pkg.version}`);

    const args = argsParser(process.argv);
    const options = {
      ...{
        url: null,
        src: null,
        dest: null,
        type: 'png',
        quality: 80,
        width: 800,
        height: 600,
        'slow-motion': 0,
        delay: 1000,
        'cookie-name': null,
        'cookie-value': null,
        'local-server': false,
        port: 3000,
        debug: false,
      },
      ...args
    };

    if (!options.url && !options.src) {
      return signale.error('No url or src arg provided');
    }
    if (!options.dest) {
      return signale.error('No dest arg provided');
    }

    spinner = ora('Starting puoppeteer browser').start();
    const browser = await puppeteer.launch({
      headless: true,
      slowMo: options['slow-motion'],
      defaultViewport: {
        width: options.width,
        height: options.height
      }
    });
    const page = await browser.newPage();

    if (options.debug) {
      page.on('console', message => {
        signale.debug(`${message.type().toUpperCase()}: ${message.text()}`);
      }).on('pageerror', ({message}) => {
        signale.debug(`PAGEERROR: ${message}`);
      }).on('response', response => {
        signale.debug(`RESPONSE ${response.status()}: ${response.url()}`);
      }).on('requestfailed', request => {
        signale.debug(`REQUEST FAILED ${request.failure() ? request.failure().errorText : ''}: ${request.url()}`)
      });
    }
    spinner.succeed();
    spinner = ora('Loading page').start();
    if (options.url) {
      if (options['cookie-name'] && options['cookie-value']) {
        const url = urlParser.parse(options.url);
        await page.setCookie({name: options['cookie-name'], value: options['cookie-value'], domain: url.hostname});
      }
      await page.goto(options.url, {waitUntil: 'domcontentloaded'});
    } else if (options['local-server']) {
      const app = express();
      let filename = 'index.html';
      if(fs.lstatSync(options.src).isDirectory()) {
        app.use(express.static(options.src));
      } else {
        app.use(express.static(path.dirname(options.src)));
        filename = path.basename(options.src);
      }
      if (options['cookie-name'] && options['cookie-value']) {
        await page.setCookie({name: options['cookie-name'], value: options['cookie-value'], domain: 'localhost'});
      }
      app.listen(options.port, async () => {
        await page.goto(`http://localhost:${options.port}/${filename}`, {waitUntil: 'domcontentloaded'});
      });
    } else {
      await page.goto(`file://${options.src}`, {waitUntil: 'domcontentloaded'});
    }
    await page.waitForSelector('body');
    spinner.succeed();
    spinner = ora('Taking screenshot').start();
    await sleep(options.delay);
    const screenshotOption = {
      type: options.type,
      path: options.dest,
      fullPage: false,
    };
    if (options.type === 'jpeg') {
      screenshotOption.quality = options.quality;
    }
    await page.screenshot(screenshotOption);
    await browser.close();
    spinner.succeed();
    process.exit(0);
  } catch (err) {
    if (spinner) {
      spinner.stop();
    }
    signale.error(err);
    process.exit(1);
  }
})();

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}