# Enterprise Android Appium Automation Framework

This repository contains a complete, enterprise-grade Android end-to-end automation framework with CI/CD pipeline integration, GitHub Pages reporting, and automatic test generation capabilities.

## Architecture Highlights
- **Language:** Java 17
- **Test Runner:** TestNG (Parallel Execution, Retry, Listeners)
- **Mobile Automation:** Appium (UiAutomator2)
- **Reporting:** ExtentReports (HTML), Apache POI (Excel), Custom Markdown (GitHub Actions)
- **CI/CD:** GitHub Actions (macOS runners for hardware acceleration)

---

## 1. Local Execution Guide

### Prerequisites
- Java 17 installed
- Maven installed
- Node.js installed
- Appium 2.x installed (`npm install -g appium`)
- Appium UiAutomator2 driver installed (`appium driver install uiautomator2`)
- Android SDK & Emulator running (or connected real device)

### Steps to Run
1. Start Appium Server:
   ```bash
   appium
   ```
2. Ensure your Android Emulator is running and device is visible via `adb devices`.
3. Execute the test suite via Maven:
   ```bash
   mvn clean test
   ```
4. View Reports locally:
   - **HTML Report:** `reports/HTML/execution-report.html`
   - **Excel Report:** `reports/Excel/Automation_Test_Report.xlsx`

---

## 2. CI/CD Execution Guide

The CI/CD pipeline is fully automated via GitHub Actions (`.github/workflows/android-e2e.yml`).

### Workflow Triggers
- **Push / Pull Request:** Automatically runs on changes to `main`/`master`.
- **Scheduled:** Runs nightly (`cron: '0 0 * * *'`).
- **Manual Dispatch:** Can be triggered manually from the GitHub Actions UI.

### Pipeline Execution Flow
1. Sets up macOS runner.
2. Configures Java 17, Node.js, and Appium.
3. Starts the Android Emulator via `reactivecircus/android-emulator-runner`.
4. Executes the 511+ test cases in parallel via Maven.
5. Captures screenshots and logs on failure.
6. Generates HTML, Excel, and Markdown reports.
7. Uploads artifacts (Logs, Screenshots, Reports) with 30-day retention.
8. Deploys reports to GitHub Pages keeping historical records.

---

## 3. Repository Configuration Guide

### GitHub Pages Setup
To enable GitHub Pages reporting:
1. Go to your repository settings on GitHub.
2. Navigate to **Pages** (under the "Code and automation" section).
3. Set the **Source** to "Deploy from a branch".
4. Select the `gh-pages` branch (this branch will be created automatically by the workflow on the first run on `main`) and the `/ (root)` folder.
5. Save. Your reports will be live at `https://<github-username>.github.io/<repository-name>/reports/latest/execution-report.html`.

### Permissions
Ensure your GitHub Actions runner has permissions to write to the repository (needed for GitHub Pages deployment):
- Go to **Settings > Actions > General**.
- Under "Workflow permissions", select **Read and write permissions**.

---

## 4. Troubleshooting Guide

### Emulator Startup Fails in CI
- Check the `Android Emulator` step logs in GitHub Actions.
- macOS runners are required because Linux runners do not support hardware acceleration (KVM) natively on GitHub Actions.

### Appium Connection Refused
- Ensure Appium server is actually started. Locally, check the terminal running Appium. In CI, check the `appium.log` artifact.
- Ensure the `systemPort` is available and not blocked if running multiple parallel threads.

### OutOfMemoryError in Maven
- Since there are 500+ tests running in parallel, you might need to increase Maven memory limit.
- Run with `MAVEN_OPTS="-Xmx2048m" mvn clean test`.

### Screenshots Not Capturing
- Ensure Appium session is still active when the failure occurs. If the driver crashes before the listener triggers, the screenshot will fail.

## Test Generation

To regenerate or modify the 500+ test cases, run:
```bash
javac Generator.java
java Generator
```
This updates the classes in `src/test/java/...` and regenerates `testng.xml`.
