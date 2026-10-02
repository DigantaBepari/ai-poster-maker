import puppeteer, { type Browser } from "puppeteer";
let browser: Promise<Browser> | undefined;
function getBrowser() {
  browser ??= puppeteer
    .launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args:
        process.env.NODE_ENV === "production"
          ? [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-dev-shm-usage",
            ]
          : [],
    })
    .then((b) => {
      b.on("disconnected", () => {
        browser = undefined;
      });
      return b;
    })
    .catch((e) => {
      browser = undefined;
      throw e;
    });
  return browser;
}
export async function closeRenderer() {
  if (browser) {
    const b = await browser;
    browser = undefined;
    await b.close();
  }
}
export async function renderPoster(html: string) {
  const b = await getBrowser();
  const page = await b.newPage();
  try {
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });
    await page.setRequestInterception(true);
    page.on("request", (r) => {
      if (r.url().startsWith("data:") || r.url() === "about:blank")
        void r.continue();
      else void r.abort();
    });
    await page.setContent(html, { waitUntil: "load", timeout: 30000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((img) => img.decode()));
      for (const el of document.querySelectorAll<HTMLElement>("[data-fit]")) {
        const text = el.firstElementChild as HTMLElement;
        let size = parseFloat(getComputedStyle(el).fontSize);
        while (
          size > 7 &&
          (text.scrollHeight > el.clientHeight - 4 ||
            text.scrollWidth > el.clientWidth - 10)
        ) {
          size -= 0.5;
          el.style.fontSize = size + "px";
        }
        if (
          text.scrollHeight > el.clientHeight ||
          text.scrollWidth > el.clientWidth
        )
          throw new Error("Text cannot fit");
      }
    });
    const png = Buffer.from(
      await page.screenshot({ type: "png", fullPage: false }),
    );
    const pdf = Buffer.from(
      await page.pdf({
        printBackground: true,
        preferCSSPageSize: true,
        timeout: 30000,
      }),
    );
    return { png, pdf };
  } finally {
    await page.close();
  }
}
