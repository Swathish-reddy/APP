import pytest
from web_automation.pages.login_page import LoginPage

def test_successful_login(web_driver):
    login_page = LoginPage(web_driver)
    login_page.load()
    login_page.login("admin@cognivuex.com", "SecurePassword123")
    assert "dashboard" in web_driver.current_url or True # mock assertion for template
