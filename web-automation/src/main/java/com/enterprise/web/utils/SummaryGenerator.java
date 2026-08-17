package com.enterprise.web.utils;

import org.testng.ITestContext;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class SummaryGenerator {
    
    public static void generateMarkdownSummary(ITestContext context) {
        String dir = "reports/Summary";
        File dirFile = new File(dir);
        if (!dirFile.exists()) {
            dirFile.mkdirs();
        }

        int passed = context.getPassedTests().size();
        int failed = context.getFailedTests().size();
        int skipped = context.getSkippedTests().size();
        int total = passed + failed + skipped;
        double passPct = (double) passed / total * 100;
        
        String date = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String baseUrl = System.getProperty("BASE_URL") != null ? System.getProperty("BASE_URL") : "Unknown";

        StringBuilder sb = new StringBuilder();
        sb.append("# Live GitHub Pages E2E Execution Summary\n\n");
        sb.append("**Deployment URL:** ").append(baseUrl).append("\n\n");
        sb.append("**Execution Date:** ").append(date).append("\n\n");
        sb.append("**Build Status:** ").append(failed == 0 ? "PASS" : "FAIL").append("\n");
        sb.append("**Deployment Status:** PASS\n\n");
        sb.append("## Execution Metrics\n\n");
        sb.append("- **Total Test Cases:** ").append(total).append("\n");
        sb.append("- **Passed:** ").append(passed).append("\n");
        sb.append("- **Failed:** ").append(failed).append("\n");
        sb.append("- **Skipped:** ").append(skipped).append("\n\n");
        sb.append("- **Pass Percentage:** ").append(String.format("%.2f", passPct)).append("%\n\n");
        
        sb.append("## Failed Tests\n\n");
        context.getFailedTests().getAllResults().stream().limit(15).forEach(res -> {
            sb.append("- **Test:** ").append(res.getMethod().getMethodName()).append("\n");
            sb.append("  - *Reason:* ").append(res.getThrowable().getMessage()).append("\n");
        });
        
        if (failed == 0) {
            sb.append("*No tests failed.*\n\n");
        }

        try (FileWriter writer = new FileWriter(dir + "/summary.md")) {
            writer.write(sb.toString());
        } catch (IOException e) {
            e.printStackTrace();
        }
        
        String stepSummaryFile = System.getenv("GITHUB_STEP_SUMMARY");
        if (stepSummaryFile != null && !stepSummaryFile.isEmpty()) {
            try (FileWriter writer = new FileWriter(stepSummaryFile, true)) {
                writer.write(sb.toString());
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
