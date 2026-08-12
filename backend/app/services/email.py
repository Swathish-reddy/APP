import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger(__name__)

async def send_otp_email(to_email: str, otp: str, user_name: str | None = "User"):
    """
    Sends a 6-digit OTP to the user's email.
    If SMTP settings are missing, logs the OTP to console for development.
    """
    subject = "Password Reset Verification Code"
    body = f"""
    Hello {user_name},

    Your password reset verification code is:

    {otp}

    This code expires in 10 minutes.

    If you did not request this password reset, you can safely ignore this email.

    Regards,
    CognivueX Team
    """

    # Check if SMTP is configured
    smtp_host = getattr(settings, "SMTP_HOST", None)
    smtp_port = getattr(settings, "SMTP_PORT", 587)
    smtp_user = getattr(settings, "SMTP_USER", None)
    smtp_password = getattr(settings, "SMTP_PASSWORD", None)
    smtp_from = getattr(settings, "SMTP_FROM_EMAIL", "noreply@cognivuex.com")

    if not smtp_host or not smtp_user or not smtp_password:
        # Mock email delivery for development
        logger.warning(f"\n{'='*50}\n[MOCK EMAIL] To: {to_email}\nSubject: {subject}\n{body}\n{'='*50}")
        print(f"\n{'='*50}\n[MOCK EMAIL] To: {to_email}\nSubject: {subject}\n{body}\n{'='*50}")
        return True

    try:
        msg = EmailMessage()
        msg.set_content(body)
        msg['Subject'] = subject
        msg['From'] = smtp_from
        msg['To'] = to_email

        # Send via sync smtplib (use aiosmtplib in production for truly async)
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
            
        logger.info(f"Successfully sent OTP email to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e!s}")
        # For development, if sending fails, fallback to printing
        print(f"\n{'='*50}\n[FAILED EMAIL FALLBACK - MOCK] To: {to_email}\nSubject: {subject}\n{body}\n{'='*50}")
        return False

async def send_password_changed_email(to_email: str, user_name: str | None = "User"):
    """
    Sends a confirmation email that the password was changed.
    """
    subject = "Password Changed Successfully"
    body = f"""
    Hello {user_name},

    Your password was recently changed.
    If you did this, you can safely ignore this email.
    
    If you did not request this password reset, please contact support immediately.

    Regards,
    CognivueX Team
    """

    smtp_host = getattr(settings, "SMTP_HOST", None)
    smtp_port = getattr(settings, "SMTP_PORT", 587)
    smtp_user = getattr(settings, "SMTP_USER", None)
    smtp_password = getattr(settings, "SMTP_PASSWORD", None)
    smtp_from = getattr(settings, "SMTP_FROM_EMAIL", "noreply@cognivuex.com")

    if not smtp_host or not smtp_user or not smtp_password:
        logger.warning(f"\n{'='*50}\n[MOCK EMAIL] To: {to_email}\nSubject: {subject}\n{body}\n{'='*50}")
        print(f"\n{'='*50}\n[MOCK EMAIL] To: {to_email}\nSubject: {subject}\n{body}\n{'='*50}")
        return True

    try:
        msg = EmailMessage()
        msg.set_content(body)
        msg['Subject'] = subject
        msg['From'] = smtp_from
        msg['To'] = to_email

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
            
        logger.info(f"Successfully sent password change confirmation to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e!s}")
        return False
