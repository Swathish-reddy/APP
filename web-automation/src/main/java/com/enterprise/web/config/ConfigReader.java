package com.enterprise.web.config;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

public class ConfigReader {
    private static Properties properties;

    static {
        try {
            String path = "src/main/resources/config.properties";
            // Check if file exists, else use defaults
            java.io.File f = new java.io.File(path);
            properties = new Properties();
            if (f.exists()) {
                FileInputStream input = new FileInputStream(path);
                properties.load(input);
                input.close();
            } else {
                properties.setProperty("implicitWait", "10");
                properties.setProperty("explicitWait", "15");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static String getProperty(String key) {
        return properties.getProperty(key);
    }
}
