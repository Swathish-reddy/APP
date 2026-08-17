package com.enterprise.web.tests;

import com.enterprise.web.drivers.WebDriverFactory;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Optional;
import org.testng.annotations.Parameters;

public class BaseTest {
    protected String baseUrl;

    @BeforeMethod(alwaysRun = true)
    public void setUp() {
        WebDriverFactory.initDriver();
        // Priority: 1. System Property (-DBASE_URL=), 2. Environment Variable, 3. Default (if locally executed)
        baseUrl = System.getProperty("BASE_URL");
        if (baseUrl == null || baseUrl.isEmpty()) {
            baseUrl = System.getenv("BASE_URL");
        }
        if (baseUrl == null || baseUrl.isEmpty()) {
            baseUrl = "https://example.com"; // Generic fallback for local development if not set
        }
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        WebDriverFactory.quitDriver();
    }
}
