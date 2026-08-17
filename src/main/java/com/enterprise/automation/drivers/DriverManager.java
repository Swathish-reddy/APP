package com.enterprise.automation.drivers;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.options.UiAutomator2Options;
import org.openqa.selenium.remote.DesiredCapabilities;
import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;

public class DriverManager {
    private static final ThreadLocal<AppiumDriver> driver = new ThreadLocal<>();

    public static void initDriver(String udid, String systemPort) {
        if (driver.get() == null) {
            try {
                UiAutomator2Options options = new UiAutomator2Options();
                options.setPlatformName("Android");
                options.setAutomationName("UiAutomator2");
                options.setAppPackage("com.android.settings"); // Default sample app
                options.setAppActivity(".Settings");
                options.setNoReset(true);
                
                if (udid != null && !udid.isEmpty()) {
                    options.setUdid(udid);
                }
                if (systemPort != null && !systemPort.isEmpty()) {
                    options.setSystemPort(Integer.parseInt(systemPort));
                }

                String appiumUrl = "http://127.0.0.1:4723"; // Default Appium server URL
                AppiumDriver appiumDriver = new AndroidDriver(new URL(appiumUrl), options);
                appiumDriver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
                driver.set(appiumDriver);
            } catch (MalformedURLException e) {
                e.printStackTrace();
                throw new RuntimeException("Failed to initialize Appium Driver");
            }
        }
    }

    public static AppiumDriver getDriver() {
        return driver.get();
    }

    public static void quitDriver() {
        if (driver.get() != null) {
            driver.get().quit();
            driver.remove();
        }
    }
}
