#!/usr/bin/env node

const pkg = require('./package.json');
const puppeteer = require('puppeteer');
const signale = require('signale');
const ora = require('ora');
const args = require('args-parser')(process.argv);
const express = require('express');
const path = require('path');
const fs = require('fs');

(async () => {
  let spinner;
  try {
    signale.start(`html2image v${pkg.version}`);

    if (!args.url && !args.src) {
      return signale.error('No url or src arg provided');
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
    if (args.debug) {
      page.on('console', message => {
        signale.debug(`${message.type().substr(0, 3).toUpperCase()}: ${message.text()}`);
      });
    }
    spinner.succeed();
    spinner = ora('Loading page').start();
    if (args.url) {
      await page.goto(args.url, {waitUntil: 'domcontentloaded'});
    } else if (args['local-server']) {
      if (!args.port) {
        args.port = 3000;
      }
      const app = express();
      let filename = 'index.html';
      if(fs.lstatSync(args.src).isDirectory()) {
        app.use(express.static(args.src));
      } else {
        app.use(express.static(path.dirname(args.src)));
        filename = path.basename(args.src);
      }
      app.listen(args.port, async () => {
        await page.goto(`http://localhost:${args.port}/${filename}`, {waitUntil: 'domcontentloaded'});
      });
    } else {
      await page.goto(`file://${args.src}`, {waitUntil: 'domcontentloaded'});
    }
    await page.waitForSelector('body');
    spinner.succeed();
    spinner = ora('Taking screenshot').start();
    await sleep(3000);
    await page.screenshot({
      type: 'jpeg',
      path: args.dest,
      fullPage: false,
    });
    //await browser.close();
    spinner.succeed();
  } catch (err) {
    if (spinner) {
      spinner.stop();
    }
    signale.error(err);
  }
  process.exit();
})();

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}