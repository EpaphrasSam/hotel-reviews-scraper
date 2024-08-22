import puppeteer from "puppeteer-core";

const BROWSER_WS_ENDPOINT = process.env.BROWSER_WS_ENDPOINT!;

export const initBrowser = async () => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: BROWSER_WS_ENDPOINT,
  });
  console.log("Connected! Navigate to site...");
  return browser;
};
