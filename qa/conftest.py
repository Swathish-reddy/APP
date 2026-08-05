import pytest
from selenium import webdriver
from appium import webdriver as appium_driver
from appium.options.android import UiAutomator2Options

@pytest.fixture(scope="session")
def web_driver():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(10)
    yield driver
    driver.quit()

@pytest.fixture(scope="session")
def mobile_driver():
    options = UiAutomator2Options()
    options.platform_name = 'Android'
    options.app_package = 'com.cognivuex.app'
    options.app_activity = 'com.cognivuex.app.MainActivity'
    options.no_reset = True
    driver = appium_driver.Remote('http://localhost:4723/wd/hub', options=options)
    yield driver
    driver.quit()
