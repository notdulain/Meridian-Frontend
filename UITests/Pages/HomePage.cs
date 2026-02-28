using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace UITests.Pages;

/// <summary>
/// Page Object for the Home page (http://localhost:3000).
/// All element selectors for this page live here.
/// </summary>
public class HomePage
{
    private readonly IWebDriver _driver;
    private readonly WebDriverWait _wait;

    public HomePage(IWebDriver driver)
    {
        _driver = driver;
        _wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
    }

    // ── Selectors ──────────────────────────────────────────────────────────────

    /// <summary>The browser tab title of the page.</summary>
    public string PageTitle => _driver.Title;

    /// <summary>The main H1 heading on the page.</summary>
    public IWebElement Heading => _driver.FindElement(By.TagName("h1"));

    /// <summary>All stat cards on the dashboard.</summary>
    public IReadOnlyCollection<IWebElement> StatCards => _driver.FindElements(By.ClassName("stat-card"));

    /// <summary>The Recent Deliveries table.</summary>
    public IWebElement DeliveriesTable => _driver.FindElement(By.TagName("table"));

    // ── Actions ────────────────────────────────────────────────────────────────

    /// <summary>Navigate to the home page.</summary>
    public void GoTo(string baseUrl)
    {
        _driver.Navigate().GoToUrl(baseUrl);
    }

    /// <summary>Wait until the page heading is visible.</summary>
    public IWebElement WaitForHeading()
    {
        return _wait.Until(d => d.FindElement(By.TagName("h1")));
    }
}
