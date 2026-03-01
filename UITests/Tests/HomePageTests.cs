using NUnit.Framework;
using UITests.Helpers;
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

    [OneTimeSetUp]
    public void SetupHomePage()
    {
        // NUnit automatically runs BaseTest.OneTimeSetUp() first (opens Chrome),
        // so Driver is already ready here.
        _homePage = new HomePage(Driver);
        _homePage.GoTo(BaseUrl);
    }

    // ============================================================
    // TEST 1 — Page loads at the correct URL
    // ============================================================
    [Test]
    [Description("Verify the home page loads successfully")]
    public void HomePage_Loads_Successfully()
    {
        VisualHelper.ShowBanner(Driver, "Page URL check");

        Assert.That(Driver.Url, Does.Contain("localhost:3000"),
            "Page URL should contain localhost:3000");

        VisualHelper.RemoveBanner(Driver);
        _homePage.WaitBriefly(800);
    }

    // ============================================================
    // TEST 2 — Browser tab title is not empty
    // ============================================================
    [Test]
    [Description("Verify the page has a valid title")]
    public void HomePage_HasTitle()
    {
        VisualHelper.ShowBanner(Driver, "Page title check");

        var title = _homePage.PageTitle;

        Assert.That(title, Is.Not.Null.And.Not.Empty,
            "Page title should not be empty");

        Console.WriteLine($"Page title: {title}");

        VisualHelper.RemoveBanner(Driver);
        _homePage.WaitBriefly(800);
    }

    // ============================================================
    // TEST 3 — Main H1 heading is visible
    // ============================================================
    [Test]
    [Description("Verify the main H1 heading is visible on the page")]
    public void HomePage_HasVisibleHeading()
    {
        VisualHelper.ShowBanner(Driver, "H1 heading check");

        var heading = _homePage.WaitForHeading();

        // Highlight the heading so you can see which element is being checked.
        VisualHelper.Highlight(Driver, heading);

        Assert.That(heading, Is.Not.Null, "Page should have an H1 heading");
        Assert.That(heading.Displayed, Is.True, "H1 heading should be visible");

        Console.WriteLine($"Heading text: {heading.Text}");

        VisualHelper.RemoveBanner(Driver);
        _homePage.WaitBriefly(800);
    }

    // ============================================================
    // TEST 4 — Dashboard shows at least one stat card
    // ============================================================
    [Test]
    [Description("Verify the dashboard displays stat cards")]
    public void HomePage_HasStatCards()
    {
        VisualHelper.ShowBanner(Driver, "Stat cards check");

        var cards = _homePage.StatCards;

        // Highlight every stat card one by one.
        foreach (var card in cards)
            VisualHelper.Highlight(Driver, card, holdMs: 400);

        Assert.That(cards.Count, Is.GreaterThan(0),
            "Dashboard should display at least one stat card");

        Console.WriteLine($"Found {cards.Count} stat card(s) on the dashboard");

        VisualHelper.RemoveBanner(Driver);
        _homePage.WaitBriefly(800);
    }

    // ============================================================
    // TEST 5 — Recent Deliveries table is visible
    // ============================================================
    [Test]
    [Description("Verify the Recent Deliveries table is visible")]
    public void HomePage_HasDeliveriesTable()
    {
        VisualHelper.ShowBanner(Driver, "Deliveries table check");

        var table = _homePage.DeliveriesTable;

        // Highlight the table so you can see it being verified.
        VisualHelper.Highlight(Driver, table);

        Assert.That(table, Is.Not.Null, "Dashboard should have a deliveries table");
        Assert.That(table.Displayed, Is.True, "Deliveries table should be visible");

        VisualHelper.RemoveBanner(Driver);
        _homePage.WaitBriefly(2000); // Final pause before Chrome closes
    }
}
