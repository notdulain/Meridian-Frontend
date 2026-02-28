# Meridian UI Automation Framework

This project contains the Selenium UI automation tests for the Meridian Frontend.

## Prerequisites

1. **Chrome Browser**: You need Google Chrome installed on your machine.
2. **.NET SDK**: Make sure you have the .NET SDK (v10.0 or compatible) installed (`dotnet --version`).
3. **Frontend Running**: The Next.js frontend must be running locally.

## How to Run Tests

1. Start the Next.js frontend:
   ```powershell
   cd Meridian-Frontend
   npm run dev
   ```
   (Wait until it says Ready and is accessible at `http://localhost:3000`)

2. Open a new terminal and run the tests:
   ```powershell
   cd Meridian-Frontend/UITests
   dotnet test
   ```

## Project Structure (Page Object Model)

- `BaseTest.cs`: Setup and teardown (launches/closes Chrome). Configured to run Chrome in headless mode.
- `Pages/`: Contains Page Object classes (e.g., `HomePage.cs`). These encapsulate the element selectors and interactions for a specific page.
- `Tests/`: Contains the actual NUnit test classes (e.g., `HomePageTests.cs`). Tests use the Page Objects to interact with the UI.

## Troubleshooting

- If tests fail, verify the frontend is actually running on port 3000.
- If you want to watch the browser execute tests, open `BaseTest.cs` and remove or comment out `options.AddArgument("--headless=new");`.
