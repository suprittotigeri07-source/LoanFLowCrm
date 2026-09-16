import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

def send_telecaller_credentials_email(user, raw_password, login_url=None):
    """
    Sends automatic login credential email to newly created Telecaller or ASM.
    """
    if not login_url:
        login_url = getattr(settings, 'FRONTEND_LOGIN_URL', 'https://loan-f-low-crm.vercel.app/login')

    role_title = user.get_role_display() if hasattr(user, 'get_role_display') else str(user.role)
    subject = f"Account Created Successfully – {role_title} Login Credentials"
    message = (
        f"Hello {user.name},\n\n"
        f"Your {role_title} account has been created successfully in LoanFlow CRM by the Super Admin.\n\n"
        f"Here are your login credentials:\n"
        f"----------------------------------------\n"
        f"Employee ID : {user.employee_id}\n"
        f"Email       : {user.email}\n"
        f"Password    : {raw_password}\n"
        f"Portal URL  : {login_url}\n"
        f"----------------------------------------\n\n"
        f"Please click the portal link above to log in using your Employee ID or Email and password.\n"
        f"You will be prompted to set a new password upon your first login.\n\n"
        f"Best Regards,\n"
        f"Shri Siddharoodha Business Loan CRM Admin Team"
    )
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'LoanFlow CRM <noreply@loanflow.com>')

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
