package com.enterprise.automation.listeners;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import com.enterprise.automation.utils.ExcelReportGenerator;
import com.enterprise.automation.utils.ExtentReportManager;
import com.enterprise.automation.utils.ScreenshotUtil;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

public class TestListener implements ITestListener {

    private static ExtentReports extent = ExtentReportManager.getInstance();
    private static ThreadLocal<ExtentTest> test = new ThreadLocal<>();

    @Override
    public void onTestStart(ITestResult result) {
        ExtentTest extentTest = extent.createTest(result.getMethod().getMethodName());
        test.set(extentTest);
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        test.get().log(Status.PASS, "Test Passed");
        recordExcel(result, "PASS");
    }

    @Override
    public void onTestFailure(ITestResult result) {
        String testName = result.getMethod().getMethodName();
        test.get().log(Status.FAIL, result.getThrowable());
        
        String screenshotPath = ScreenshotUtil.captureScreenshot(testName);
        if (!screenshotPath.isEmpty()) {
            test.get().addScreenCaptureFromPath(screenshotPath);
        }
        recordExcel(result, "FAIL");
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        test.get().log(Status.SKIP, "Test Skipped");
        recordExcel(result, "SKIP");
    }

    @Override
    public void onFinish(ITestContext context) {
        extent.flush();
        ExcelReportGenerator.generateReport();
        com.enterprise.automation.utils.SummaryGenerator.generateMarkdownSummary(context);
    }
    
    private void recordExcel(ITestResult result, String status) {
        String testName = result.getMethod().getMethodName();
        // Assuming test name contains module and ID for simple generation, 
        // e.g., "TC_AUTH_001_ValidLogin"
        String[] parts = testName.split("_", 4);
        String moduleId = parts.length > 1 ? parts[1] : "General";
        String testId = parts.length > 2 ? parts[0] + "_" + parts[1] + "_" + parts[2] : "Unknown";
        String duration = String.valueOf(result.getEndMillis() - result.getStartMillis());
        
        ExcelReportGenerator.addResult(new String[]{
            testId, moduleId, testName, "High", status, duration
        });
    }
}
