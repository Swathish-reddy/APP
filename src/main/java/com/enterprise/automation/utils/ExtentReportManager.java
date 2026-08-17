package com.enterprise.automation.utils;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;

import java.io.File;

public class ExtentReportManager {
    private static ExtentReports extent;

    public static ExtentReports getInstance() {
        if (extent == null) {
            String reportDir = "reports/HTML";
            File dir = new File(reportDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            ExtentSparkReporter sparkReporter = new ExtentSparkReporter(reportDir + "/execution-report.html");
            sparkReporter.config().setTheme(Theme.DARK);
            sparkReporter.config().setDocumentTitle("Android E2E Automation Report");
            sparkReporter.config().setReportName("Execution Report");

            extent = new ExtentReports();
            extent.attachReporter(sparkReporter);
            extent.setSystemInfo("Platform", "Android");
            extent.setSystemInfo("Environment", "QA");
        }
        return extent;
    }
}
