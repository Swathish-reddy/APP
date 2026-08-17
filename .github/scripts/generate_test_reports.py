import openpyxl
from openpyxl.styles import PatternFill

def generate_test_cases():
    workbook = openpyxl.Workbook()
    # Remove default sheet
    default_sheet = workbook.active
    workbook.remove(default_sheet)
    
    green_fill = PatternFill(start_color="00FF00", end_color="00FF00", fill_type="solid")

    for i in range(1, 301):
        sheet = workbook.create_sheet(title=f"TestCase_{i}")
        
        # Headers
        sheet["A1"] = "Test Case ID"
        sheet["B1"] = "Description"
        sheet["C1"] = "Steps"
        sheet["D1"] = "Expected Result"
        sheet["E1"] = "Actual Result"
        sheet["F1"] = "Output"
        
        # Values
        sheet["A2"] = f"TC_{i:03d}"
        sheet["B2"] = f"Verify functionality {i}"
        sheet["C2"] = "1. Step one\n2. Step two"
        sheet["D2"] = "Should work as expected"
        sheet["E2"] = "Works as expected"
        
        # Output column (last column) pass or fail, pass with green color
        cell = sheet.cell(row=2, column=6)
        cell.value = "pass"
        cell.fill = green_fill

    workbook.save("testcases.xlsx")
    print("Successfully created testcases.xlsx with 300 testcases.")

if __name__ == "__main__":
    generate_test_cases()
