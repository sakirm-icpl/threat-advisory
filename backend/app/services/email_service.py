import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class EmailService:
    """Service for sending emails"""
    
    def __init__(self):
        # Email configuration from environment variables
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_username = os.getenv('SMTP_USERNAME', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.from_email = os.getenv('FROM_EMAIL', self.smtp_username)
        self.from_name = os.getenv('FROM_NAME', 'VersionIntel')
        
        # Application URLs
        self.frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        
    def is_configured(self) -> bool:
        """Check if email service is properly configured"""
        return bool(self.smtp_username and self.smtp_password)
    
    def send_invite_email(self, email: str, role: str, inviter_name: str, invite_token: str) -> bool:
        """Send invitation email to user"""
        if not self.is_configured():
            logger.error("Email service not configured. Please set SMTP_USERNAME and SMTP_PASSWORD")
            return False
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"Invitation to join VersionIntel - {self.from_name}"
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = email
            
            # Create login URL with invite token
            login_url = f"{self.frontend_url}/login?invite={invite_token}"
            
            # Email content
            text_content = f"""
Hello!

You have been invited by {inviter_name} to join VersionIntel, a comprehensive cybersecurity platform for version detection and vulnerability analysis.

Your role: {role.title()}

To accept this invitation, please click the link below:
{login_url}

This invitation will expire in 7 days.

If you have any questions, please contact your administrator.

Best regards,
The VersionIntel Team
            """.strip()
            
            html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VersionIntel Invitation</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }}
        .container {{
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e9ecef;
        }}
        .logo {{
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }}
        .subtitle {{
            color: #6b7280;
            font-size: 16px;
        }}
        .content {{
            margin-bottom: 30px;
        }}
        .role-badge {{
            display: inline-block;
            background: #dbeafe;
            color: #1e40af;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
        }}
        .cta-button {{
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: background-color 0.2s;
        }}
        .cta-button:hover {{
            background: #1d4ed8;
        }}
        .footer {{
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
        }}
        .warning {{
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 12px;
            margin: 20px 0;
            font-size: 14px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🛡️ VersionIntel</div>
            <div class="subtitle">Cybersecurity Intelligence Platform</div>
        </div>
        
        <div class="content">
            <h2>You're Invited!</h2>
            <p>Hello!</p>
            <p>You have been invited by <strong>{inviter_name}</strong> to join VersionIntel, a comprehensive cybersecurity platform for version detection and vulnerability analysis.</p>
            
            <p>Your assigned role: <span class="role-badge">{role.title()}</span></p>
            
            <div class="warning">
                <strong>⚠️ Important:</strong> This invitation will expire in 7 days.
            </div>
            
            <div style="text-align: center;">
                <a href="{login_url}" class="cta-button">Accept Invitation</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">{login_url}</p>
        </div>
        
        <div class="footer">
            <p>If you have any questions, please contact your administrator.</p>
            <p>Best regards,<br>The VersionIntel Team</p>
        </div>
    </div>
</body>
</html>
            """.strip()
            
            # Attach parts
            text_part = MIMEText(text_content, 'plain')
            html_part = MIMEText(html_content, 'html')
            
            msg.attach(text_part)
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Invitation email sent successfully to {email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send invitation email to {email}: {str(e)}")
            return False
    
    def send_test_email(self, email: str) -> bool:
        """Send a test email to verify configuration"""
        if not self.is_configured():
            return False
        
        try:
            msg = MIMEMultipart()
            msg['Subject'] = "VersionIntel Email Test"
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = email
            
            text_content = """
This is a test email from VersionIntel to verify email configuration.

If you received this email, the email service is working correctly.

Best regards,
The VersionIntel Team
            """.strip()
            
            msg.attach(MIMEText(text_content, 'plain'))
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Test email sent successfully to {email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send test email to {email}: {str(e)}")
            return False
