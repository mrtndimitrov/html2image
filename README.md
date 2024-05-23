## Description
A `node.js` command line utility that generates an image (`png`, `jpeg` or `webp`) from html file or URL with the help of [puppeteer](https://github.com/puppeteer).

## Install
```sh
npm install -g node-html-2-image
```

## Usage
Generate an image from URL:
```sh
html2image --url=https://www.google.com --dest=google.png --type=png
```

Generate an image from local file:
```sh
html2image --src=my-site.html --dest=my-site.jpg --type=jpeg
```

Generate an image from local file but run it in a local server (many times local html files will not load Javascript so they need to be run from a local server):
```sh
html2image --src=my-site.html --local-server --dest=my-site.jpg --type=jpeg
```

## Options
List of all available options:

| option         | description                                                                    | type                      | default | required                   |
|----------------|--------------------------------------------------------------------------------|---------------------------|---------|----------------------------|
| `url`          | The URL to use for the image generation                                        | string                    | N/A     | required if `src` is empty |
| `src`          | The path to the HTML file                                                      | string                    | N/A     | required if `url` is empty |
| `dest`         | The destionation path and filename where to save the generated image           | string                    | N/A     | required                   | 
| `type`         | The type of the generated image                                                | `png` \| `jpeg` \| `webp` | `png`   | required                   |
| `quality`      | The quality of the generated image (only applicable for `jpeg`)                | number                    | 80      | optional                   |
| `width`        | The `puppeteer` page width in pixels                                           | number                    | 800     | optional                   |
| `height`       | The `puppeteer` page height in pixels                                          | number                    | 600     | optional                   |
| `slow-motion`  | The milliseconds of delay between the steps in loading the page in `puppeteer` | number                    | 0       | optional                   |
| `delay`        | The milliseconds to wait after the page is loaded and the screenshot is taken  | number                    | 1000    | optional                   |
| `cookie-name`  | A cookie name to send when requesting the `url`                                | string                    | NULL    | optional                   |
| `cookie-value` | A cookie name to send when requesting the `url`                                | string                    | NULL    | optional                   |
| `local-server` | Whether to load the `src` html in a local server                               | boolean                   | false   | optional                   |
| `port`         | The port for the local server                                                  | number                    | 3000    | optional                   |
| `debug`        | Whether to print debug information from the loaded page to the stdout          | number                    | 600     | optional                   |
