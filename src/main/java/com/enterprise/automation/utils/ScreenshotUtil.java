package com.enterprise.automation.utils;

import com.enterprise.automation.drivers.DriverManager;
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
        if (DriverManager.getDriver() == null) {
            return "";
        }
        File srcFile = ((TakesScreenshot) DriverManager.getDriver()).getScreenshotAs(OutputType.FILE);
        String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String dir = "screenshots";
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
