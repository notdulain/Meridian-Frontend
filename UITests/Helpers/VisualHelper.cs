using OpenQA.Selenium;

namespace UITests.Helpers;

/// <summary>
/// Injects visual effects into the browser during test runs so you can
/// watch exactly which element each test is checking.
///
/// All effects are done with JavaScript — no changes to the app code needed.
/// </summary>
public static class VisualHelper
{
    // ── HIGHLIGHT ───────────────────────────────────────────────────────────────
    // Draws a glowing orange border around an element, waits a moment, then
    // removes it. Call this just before an assertion to see what's being tested.
    public static void Highlight(IWebDriver driver, IWebElement element, int holdMs = 900)
    {
        var js = (IJavaScriptExecutor)driver;

        // Scroll the element smoothly to the centre of the screen first.
        js.ExecuteScript(
            "arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });",
            element);

        Thread.Sleep(300); // give the scroll animation time to finish

        // Save whatever inline style already exists so we can restore it.
        var original = element.GetAttribute("style") ?? "";

        // Apply a bright glowing outline.
        js.ExecuteScript(@"
            arguments[0].style.outline    = '3px solid #f59e0b';
            arguments[0].style.boxShadow  = '0 0 12px 4px rgba(245,158,11,0.6)';
            arguments[0].style.transition = 'outline 0.2s, box-shadow 0.2s';
        ", element);

        Thread.Sleep(holdMs); // hold the highlight so you can see it

        // Remove the highlight by restoring the original style.
        js.ExecuteScript("arguments[0].setAttribute('style', arguments[1]);", element, original);
    }

    // ── BANNER ──────────────────────────────────────────────────────────────────
    // Shows a small floating label at the top-left of the page saying which
    // test is running right now. Disappears after the test finishes.
    public static void ShowBanner(IWebDriver driver, string testName, int holdMs = 700)
    {
        var js = (IJavaScriptExecutor)driver;

        js.ExecuteScript(@"
            // Remove any old banner first
            var old = document.getElementById('__selenium_banner__');
            if (old) old.remove();

            var banner = document.createElement('div');
            banner.id = '__selenium_banner__';
            banner.innerText = '🤖 Testing: ' + arguments[0];
            banner.style.cssText = [
                'position:fixed', 'top:12px', 'left:50%',
                'transform:translateX(-50%)',
                'background:#1e293b', 'color:#f8fafc',
                'font:bold 13px/1 system-ui,sans-serif',
                'padding:8px 18px', 'border-radius:999px',
                'box-shadow:0 4px 16px rgba(0,0,0,.4)',
                'z-index:99999', 'letter-spacing:.4px',
                'border:2px solid #f59e0b'
            ].join(';');
            document.body.appendChild(banner);
        ", testName);

        Thread.Sleep(holdMs);
    }

    // Removes the banner when the test is done.
    public static void RemoveBanner(IWebDriver driver)
    {
        var js = (IJavaScriptExecutor)driver;
        js.ExecuteScript(@"
            var b = document.getElementById('__selenium_banner__');
            if (b) b.remove();
        ");
    }
}
