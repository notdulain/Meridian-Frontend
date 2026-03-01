using NUnit.Framework;
using UITests.Pages;

namespace UITests.Tests;

/// <summary>
/// UI smoke tests for the Meridian Home Page.
/// Verifies the page loads and key elements are present.
/// </summary>
[TestFixture]
public class HomePageTests : BaseTest
{
    private HomePage _homePage = null!;

    [SetUp]
    public new void SetUp()
    {
        base.SetUp();
        _homePage = new HomePage(Driver);
        _homePage.GoTo(BaseUrl);
    }

    [Test]
    [Description("Verify the home page loads successfully")]
    public void HomePage_Loads_Successfully()
    {
        // The page URL should be the base URL
        Assert.That(Driver.Url, Does.Contain("localhost:3000"),
            "Page URL should contain localhost:3000");
    }

    [Test]
    [Description("Verify the page has a valid title")]
    public void HomePage_HasTitle()
    {
        var title = _homePage.PageTitle;

        Assert.That(title, Is.Not.Null.And.Not.Empty,
            "Page title should not be empty");

        Console.WriteLine($"Page title: {title}");
    }

    [Test]
    [Description("Verify the main H1 heading is visible on the page")]
    public void HomePage_HasVisibleHeading()
    {
        var heading = _homePage.WaitForHeading();

        Assert.That(heading, Is.Not.Null, "Page should have an H1 heading");
        Assert.That(heading.Displayed, Is.True, "H1 heading should be visible");

        Console.WriteLine($"Heading text: {heading.Text}");
    }

    [Test]
    [Description("Verify the dashboard displays stat cards")]
    public void HomePage_HasStatCards()
    {
        var cards = _homePage.StatCards;

        Assert.That(cards.Count, Is.GreaterThan(0),
            "Dashboard should display at least one stat card");

        Console.WriteLine($"Found {cards.Count} stat card(s) on the dashboard");
    }

    [Test]
    [Description("Verify the Recent Deliveries table is visible")]
    public void HomePage_HasDeliveriesTable()
    {
        var table = _homePage.DeliveriesTable;

        Assert.That(table, Is.Not.Null, "Dashboard should have a deliveries table");
        Assert.That(table.Displayed, Is.True, "Deliveries table should be visible");
    }
}
