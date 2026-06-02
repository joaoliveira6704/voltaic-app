const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const path = require("path");

const SCREENSHOT_DIR = path.join(__dirname, "screenshots");

async function takeScreenshot(driver, name) {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
  const data = await driver.takeScreenshot();
  fs.writeFileSync(path.join(SCREENSHOT_DIR, `${name}.png`), data, "base64");
  console.log(`Screenshot: ${name}.png`);
}

async function main() {
  const options = new chrome.Options();
  options.excludeSwitches(["enable-logging"]); // ✅ Fix 2: array em vez de string
  options.addArguments("--log-level=3", "--silent", "--start-maximized");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    // 1 — Login
    console.log("1 — Login");
    await driver.get("http://voltaic.diacidos.pt/login");

    const email = await driver.wait(until.elementLocated(By.id("email")), 10000);
    const password = await driver.findElement(By.id("password"));

    // ✅ Fix 1: localizar o botão primeiro, depois esperar que fique enabled
    const buttonEl = await driver.wait(
      until.elementLocated(By.css("button[type='submit']")), 10000
    );
    const button = await driver.wait(until.elementIsEnabled(buttonEl), 10000);

    await email.sendKeys("valenzuelaashley@example.org");
    await password.sendKeys("+2kV!tVZ7tc_");

    try {
      await button.click();
    } catch {
      await driver.executeScript("arguments[0].click()", button);
    }

    await driver.wait(until.urlContains("/profile"), 15000);
    console.log("Login OK");
    await takeScreenshot(driver, "01-login");

    // 2 — Navigate to company dashboard
    console.log("2 — Dashboard");
    await driver.get("http://voltaic.diacidos.pt/company");
    await driver.wait(until.elementLocated(By.css("h1.text-2xl")), 15000);

    const heading = await driver.findElement(By.css("h1")).getText();
    console.log(`Company: ${heading}`);

    await driver.wait(
      until.elementLocated(By.css("[data-slot='card-title']")), 10000
    );
    const titles = await driver.findElements(By.css("[data-slot='card-title']"));
    const cardTexts = [];
    for (const el of titles) cardTexts.push(await el.getText());
    console.log("Cards found:", cardTexts.join(", "));

    await driver.wait(until.elementLocated(By.css("canvas")), 10000);
    const chartCount = (await driver.findElements(By.css("canvas"))).length;
    console.log(`Charts rendered: ${chartCount}`);
    await takeScreenshot(driver, "02-dashboard");

    // 3 — Verify weekly aggregate metrics
    console.log("3 — Weekly metrics");
    const weeklyHeader = await driver.findElement(
      By.xpath("//*[text()='Weekly Usage']")
    );
    console.log("Weekly Usage section:", await weeklyHeader.isDisplayed());

    const metricValues = await driver.findElements(
      By.css(".text-3xl.font-semibold")
    );
    if (metricValues.length > 0) {
      console.log("Metric values:");
      for (const el of metricValues) {
        const text = (await el.getText()).trim();
        if (text) console.log(`  ${text}`);
      }
    } else {
      console.log("No metric values found");
    }

    await takeScreenshot(driver, "03-metrics");
    console.log("\nDone");
  } finally {
    await driver.quit();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
