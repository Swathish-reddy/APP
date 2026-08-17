# Enterprise Web Selenium Automation Framework

This directory contains the robust, production-ready Selenium Web Automation Framework targeting the live GitHub Pages deployments.

## Architecture
- **Language:** Java 17
- **WebDriver Manager:** Bonigarcia WebDriverManager
- **Runner:** TestNG
- **Execution:** Headless Chrome (Optimized for CI/CD)
- **Reporting:** ExtentReports, Apache POI (Excel)

## Local Execution Guide
To run the 400+ tests locally:
```bash
# Export the target URL (Defaults to https://example.com if unset)
export BASE_URL="https://example.com"

# Execute
mvn clean test
```

Reports will be generated in `reports/HTML/` and `reports/Excel/`.

## CI/CD Execution Guide
The pipeline is located at `../.github/workflows/deploy-and-test.yml`.
1. It builds the frontend application (from `frontend/out` or `frontend/dist`).
2. It pushes the static build to the `gh-pages` branch.
3. A cURL loop verifies that the deployment is live (HTTP 200).
4. `mvn clean test -DBASE_URL=...` executes the Selenium tests against the verified deployment.

## Repository Configuration
To ensure GitHub Pages works correctly:
1. Ensure `Settings -> Actions -> General -> Workflow permissions` is set to "Read and write permissions".
2. Ensure `Settings -> Pages -> Build and deployment` is set to deploy from the `gh-pages` branch.

## Troubleshooting Guide
- **Tests Failing on Timeout:** Ensure `BASE_URL` is resolving. In the Action logs, verify the `Wait for Deployment and Verify` step succeeded.
- **Headless Chrome Errors:** Do not remove the `--no-sandbox` or `--disable-dev-shm-usage` flags from `WebDriverFactory.java`, as these are required for GitHub Actions runners to properly allocate memory for Chrome.
