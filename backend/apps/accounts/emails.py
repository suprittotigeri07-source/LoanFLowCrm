import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

def send_telecaller_credentials_email(user, raw_password, login_url="http://localhost:5173/login"):
    """
    Sends automatic login credential email to newly created Telecaller or ASM.
    """
    subject = f"Welcome to LoanFlow CRM – Your {user.get_role_display()} Login Credentials"
    message = (
        f"Hello {user.name},\n\n"
        f"Your LoanFlow CRM {user.get_role_display()} account has been created by the Admin.\n\n"
        f"Your login credentials are:\n\n"
        f"Employee ID:\n{user.employee_id or user.email}\n\n"
        f"Password:\n{raw_password}\n\n"
        f"Login:\n{login_url}\n\n"
        f"Please use your Employee ID and password to log in to LoanFlow CRM.\n\n"
        f"Please change your password after your first login.\n\n"
        f"Regards,\n"
        f"LoanFlow CRM Team"
    )
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@loanflow.com')

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info(f"Credentials email sent successfully to {user.email}")
        user.credentials_email_status = user.EmailStatus.SENT
        user.save(update_fields=['credentials_email_status'])
        return True
    except Exception as e:
        logger.error(f"Failed to send credentials email to {user.email}: {e}")
        user.credentials_email_status = user.EmailStatus.FAILED
        user.save(update_fields=['credentials_email_status'])
        return False


def send_password_reset_email(user, raw_password, login_url="http://localhost:5173/login"):
    """
    Sends notification email when Admin resets user password.
    """
    subject = "LoanFlow CRM – Password Reset"
    message = (
        f"Hello {user.name},\n\n"
        f"Your LoanFlow CRM password has been reset by the Admin.\n\n"
        f"Employee ID:\n{user.employee_id or user.email}\n\n"
        f"Temporary Password:\n{raw_password}\n\n"
        f"Login:\n{login_url}\n\n"
        f"Please change your password after logging in.\n\n"
        f"Regards,\n"
        f"LoanFlow CRM Team"
    )
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@loanflow.com')

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info(f"Password reset email sent successfully to {user.email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send password reset email to {user.email}: {e}")
        return False
