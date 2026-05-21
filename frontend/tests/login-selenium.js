const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

async function main() {
  const options = new chrome.Options();
  options.excludeSwitches("enable-logging");
  options.addArguments("--log-level=3");
  options.addArguments("--silent");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    await driver.get("http://localhost:5173/login");
    await driver.manage().window().maximize();

    const email = await driver.wait(
      until.elementLocated(By.id("email")),
      10000,
    );

    const password = await driver.findElement(By.id("password"));
    const button = await driver.wait(
      until.elementIsEnabled(By.css("button[type='submit']")),
      10000,
    );

    await email.sendKeys("cole32@example.com");
    await password.sendKeys("y@4uhsU4&KI7");
    await driver.wait(until.elementIsEnabled(button), 10000);

    try {
      await button.click();
    } catch {
      await driver.executeScript("arguments[0].click()", button);
    }

    const mensagem = await driver.wait(
      until.elementLocated(By.css(".flash.success")),
      10000,
    );

    console.log(await mensagem.getText());
  } finally {
    //await driver.quit();
  }
}

main().catch(console.error);
