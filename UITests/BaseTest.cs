using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using System.Runtime.InteropServices;

namespace UITests;

public class BaseTest
{
    protected IWebDriver Driver = null!;
    protected const string BaseUrl = "http://localhost:3000";

    // ── ONE WINDOW FOR ALL TESTS ────────────────────────────────────────────────
    //
    // [OneTimeSetUp] runs ONCE before the first test in this class.
    // [OneTimeTearDown] runs ONCE after the last test.
    //
    // This is why you see only ONE browser window for the whole test run.
    // If you changed these to [SetUp] / [TearDown], a new window would
    // open and close for every single test (5 windows instead of 1).
    //
    [OneTimeSetUp]
    public void OneTimeSetUp()
    {
        var options = new ChromeOptions();

        // ── CROSS-PLATFORM CHROME PATH ──────────────────────────────────────────
        // We point ChromeDriver directly to the Chrome binary.
        // Without this, macOS sometimes opens a different browser (e.g. Brave)
        // as a side effect, showing a blank "data:," window alongside the tests.
        options.BinaryLocation = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
            ? @"C:\Program Files\Google\Chrome\Application\chrome.exe"  // Windows
            : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; // macOS

        // ── HEADLESS MODE ───────────────────────────────────────────────────────
        // Headless = browser runs in background with no visible window.
        // Right now headless is OFF so you can watch the tests run live.
        // On CI/CD (e.g. GitHub Actions), uncomment the line below:
        // options.AddArgument("--headless=new");

        options.AddArgument("--no-sandbox");
        options.AddArgument("--disable-dev-shm-usage");
        options.AddArgument("--window-size=1280,800");
        options.AddArgument("--remote-allow-origins=*"); // required for Chrome 111+

        Driver = new ChromeDriver(options);
        Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(10);
    }

    // Closes the browser after the last test finishes.
    [OneTimeTearDown]
    public void OneTimeTearDown()
    {
        Driver?.Quit();
        Driver?.Dispose();
    }
}
