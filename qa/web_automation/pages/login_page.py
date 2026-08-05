from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class LoginPage:
    def __init__(self, driver):
        self.driver = driver
        self.url = "http://localhost:3000/login"
        self.email_input = (By.ID, "email")
        self.password_input = (By.ID, "password")
        self.login_btn = (By.XPATH, "//button[contains(text(),'Sign In')]")

    def load(self):
        self.driver.get(self.url)

    def login(self, email, password):
        WebDriverWait(self.driver, 10).until(EC.presence_of_element_located(self.email_input)).send_keys(email)
        self.driver.find_element(*self.password_input).send_keys(password)
        self.driver.find_element(*self.login_btn).click()
