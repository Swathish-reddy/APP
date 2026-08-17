package com.enterprise.web.utils;

import com.enterprise.web.drivers.WebDriverFactory;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;

public class ScreenshotUtil {
    public static String captureScreenshot(String testName) {
        if (WebDriverFactory.getDriver() == null) {
            return "";
        }
        File srcFile = ((TakesScreenshot) WebDriverFactory.getDriver()).getScreenshotAs(OutputType.FILE);
        String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String dir = "reports/Screenshots";
        File dirFile = new File(dir);
        if (!dirFile.exists()) {
            dirFile.mkdirs();
        }
        String destPath = dir + File.separator + testName + "_" + timestamp + ".png";
        try {
            Files.copy(srcFile.toPath(), Paths.get(destPath));
            return destPath;
        } catch (IOException e) {
            e.printStackTrace();
            return "";
        }
    }
}
