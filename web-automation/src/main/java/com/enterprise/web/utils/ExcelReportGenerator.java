package com.enterprise.web.utils;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class ExcelReportGenerator {
    private static List<String[]> results = new ArrayList<>();

    public static synchronized void addResult(String[] resultRow) {
        results.add(resultRow);
    }

    public static synchronized void generateReport() {
        String dir = "reports/Excel";
        File dirFile = new File(dir);
        if (!dirFile.exists()) {
            dirFile.mkdirs();
        }
        
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Executed Test Cases");
        
        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Test ID", "Module", "Test Name", "Priority", "Status", "Execution Time(ms)"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
        }
        
        // Data
        int rowNum = 1;
        for (String[] rowData : results) {
            Row row = sheet.createRow(rowNum++);
            for (int i = 0; i < rowData.length; i++) {
                row.createCell(i).setCellValue(rowData[i]);
            }
        }
        
        try (FileOutputStream out = new FileOutputStream(new File(dir + "/Automation_Test_Report.xlsx"))) {
            workbook.write(out);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                workbook.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
