using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;

namespace UITests;

/// <summary>
/// Base class for all UI tests.
/// Handles browser setup and teardown before/after each test.
/// </summary>
public class BaseTest
{
    protected IWebDriver Driver = null!;
    protected const string BaseUrl = "http://localhost:3000";

    [SetUp]
    public void SetUp()
    {
        var options = new ChromeOptions();
        // Run in headless mode (no visible browser window) — remove this line to see the browser
        options.AddArgument("--headless=new");
        options.AddArgument("--no-sandbox");
        options.AddArgument("--disable-dev-shm-usage");
        options.AddArgument("--window-size=1280,800");

        Driver = new ChromeDriver(options);
        Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(10);
    }

    [TearDown]
    public void TearDown()
    {
        Driver?.Quit();
        Driver?.Dispose();
    }
}
