const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const path = require("path");

const SCREENSHOT_DIR = path.join(__dirname, "screenshots", "map-test");

async function takeScreenshot(driver, name) {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
  const data = await driver.takeScreenshot();
  fs.writeFileSync(path.join(SCREENSHOT_DIR, `${name}.png`), data, "base64");
  console.log(`Screenshot: ${name}.png`);
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const options = new chrome.Options();
  options.excludeSwitches(["enable-logging"]);
  options.addArguments("--log-level=3", "--silent", "--start-maximized");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    // ── 1. Login ───────────────────────────────────────────────────────────────
    console.log("1 — Login");
    await driver.get("http://voltaic.diacidos.pt/login");

    const email = await driver.wait(until.elementLocated(By.id("email")), 10000);
    const password = await driver.findElement(By.id("password"));

    const buttonEl = await driver.wait(
      until.elementLocated(By.css("button[type='submit']")), 10000
    );
    const button = await driver.wait(until.elementIsEnabled(buttonEl), 10000);

    await email.sendKeys("valenzuelaashley@example.org");
    await password.sendKeys("+2kV!tVZ7tc_");
    try { await button.click(); } catch {
      await driver.executeScript("arguments[0].click()", button);
    }

    await driver.wait(until.urlContains("/profile"), 15000);
    console.log("Login OK");
    await takeScreenshot(driver, "01-login");

    // ── 2. Navigate to map and measure load time ───────────────────────────────
    console.log("2 — Navigate to /map");
    const startTime = Date.now();

    await driver.get("http://voltaic.diacidos.pt/map");

    await driver.wait(() =>
      driver.executeScript("return document.querySelector('#mapContainer') !== null"),
      15000,
    );
    console.log("Map container found");

    await driver.wait(() =>
      driver.executeScript(
        "return document.querySelectorAll('.maplibregl-marker').length > 0",
      ),
      15000,
    );
    const loadTime = Date.now() - startTime;
    console.log(`Map loaded in ${loadTime}ms ${loadTime < 3000 ? "OK" : "SLOW (> 3s)"}`);

    await takeScreenshot(driver, "02-map-loaded");

    const errors = await driver.findElements(By.css(".flash.error, [role='alert'], .error"));
    if (errors.length > 0) {
      console.log("ERRORS found:");
      for (const e of errors) console.log(`  ${await e.getText()}`);
    } else {
      console.log("No errors detected");
    }

    // ── 3. Click a station marker to see details ───────────────────────────────
    console.log("3 — Click station marker");

    let cardVisible = false;
    for (let attempt = 0; attempt < 8; attempt++) {
      const markers = await driver.findElements(By.css(".maplibregl-marker"));
      if (markers.length === 0) {
        console.log("  No markers found, waiting...");
        await sleep(2000);
        continue;
      }

      console.log(`  Attempt ${attempt + 1}: ${markers.length} marker(s) found, clicking...`);
      try {
        await markers[0].click();
      } catch {
        await driver.executeScript("arguments[0].click()", markers[0]);
      }

      await sleep(1500);

      try {
        await driver.findElement(By.css("h2.text-base.font-bold.text-gray-900"));
        cardVisible = true;
        console.log("  Station card appeared");
        await takeScreenshot(driver, "03-station-card");
        break;
      } catch {
        console.log("  Station card not visible yet, retrying...");
      }
    }

    if (!cardVisible) {
      console.log("WARNING: Could not open station card after 8 attempts");
      await takeScreenshot(driver, "03-card-not-found");
      throw new Error("Station card did not appear");
    }

    // ── 4. Verify station details ──────────────────────────────────────────────
    console.log("4 — Verify station details");

    const title = await driver.findElement(By.css("h2.text-base.font-bold.text-gray-900"));
    const stationName = await title.getText();
    console.log(`  Station: ${stationName}`);

    const badge = await driver.findElement(By.css(
      "span.inline-flex.items-center.gap-1\\.5.mt-1.px-2\\.5.py-0\\.5.rounded-full",
    ));
    const stateText = await badge.getText();
    console.log(`  State: ${stateText}`);

    const dot = await badge.findElement(By.css("span.w-1\\.5.h-1\\.5.rounded-full"));
    const dotColor = await dot.getAttribute("class");
    console.log(`  State dot class: ${dotColor}`);

    const pageText = await driver.findElement(By.css("body")).getText();
    const powerMatch = pageText.match(/(\d+)\s*kW/);
    if (powerMatch) {
      console.log(`  Max Power: ${powerMatch[0]}`);
    } else {
      console.log("  Max Power: not found");
    }

    try {
      const connectors = await driver.findElements(By.css(
        "span.px-2\\.5.py-1.rounded-full.text-xs.font-medium.border",
      ));
      if (connectors.length > 0) {
        console.log(`  Connectors:`);
        for (const c of connectors) console.log(`    - ${await c.getText()}`);
      } else {
        console.log("  Connectors: none found");
      }
    } catch {
      console.log("  Connectors: selector failed");
    }

    await takeScreenshot(driver, "04-details-verified");
    console.log("\nAll steps passed");
  } finally {
    await driver.quit();
  }
}

main().catch((err) => {
  console.error(`\nTest failed: ${err.message}`);
  process.exit(1);
});
