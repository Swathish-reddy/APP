package com.enterprise.automation.tests;

import com.enterprise.automation.drivers.DriverManager;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Parameters;

public class BaseTest {

    @Parameters({"udid", "systemPort"})
    @BeforeMethod(alwaysRun = true)
    public void setUp(String udid, String systemPort) {
        // Fallback for local execution if parameters are not provided
        if (udid == null) udid = "";
        if (systemPort == null) systemPort = "";
        DriverManager.initDriver(udid, systemPort);
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        DriverManager.quitDriver();
    }
}
