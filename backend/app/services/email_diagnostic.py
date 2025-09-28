import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class EmailDiagnosticService:
    """Service for diagnosing email delivery issues"""
    
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_username = os.getenv('SMTP_USERNAME', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.from_email = os.getenv('FROM_EMAIL', self.smtp_username)
        self.from_name = os.getenv('FROM_NAME', 'VersionIntel')
        
    def test_smtp_connection(self) -> dict:
        """Test SMTP connection and authentication"""
        result = {
            'connection': False,
            'authentication': False,
            'error': None,
            'server_info': None
        }
        
        try:
            # Test connection
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.set_debuglevel(1)  # Enable debug output
            
            # Test STARTTLS
            server.starttls()
            
            # Test authentication
            server.login(self.smtp_username, self.smtp_password)
            
            result['connection'] = True
            result['authentication'] = True
            result['server_info'] = {
                'server': self.smtp_server,
                'port': self.smtp_port,
                'username': self.smtp_username
            }
            
            server.quit()
            
        except smtplib.SMTPAuthenticationError as e:
            result['error'] = f"Authentication failed: {str(e)}"
        except smtplib.SMTPConnectError as e:
            result['error'] = f"Connection failed: {str(e)}"
        except Exception as e:
            result['error'] = f"Unexpected error: {str(e)}"
            
        return result
    
    def send_test_email(self, test_email: str) -> dict:
        """Send a simple test email"""
        result = {
            'sent': False,
            'error': None,
            'message_id': None
        }
        
        try:
            msg = MIMEMultipart()
            msg['Subject'] = "VersionIntel Email Test"
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = test_email
            
            # Simple text content
            text_content = """
This is a test email from VersionIntel to verify email delivery.

If you received this email, the email service is working correctly.

Best regards,
The VersionIntel Team
            """.strip()
            
            msg.attach(MIMEText(text_content, 'plain'))
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            result['sent'] = True
            logger.info(f"Test email sent successfully to {test_email}")
            
        except Exception as e:
            result['error'] = str(e)
            logger.error(f"Failed to send test email to {test_email}: {str(e)}")
            
        return result
    
    def send_corporate_friendly_email(self, email: str, role: str, inviter_name: str, invite_token: str) -> bool:
        """Send a corporate-friendly invitation email"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"VersionIntel Platform Access - {self.from_name}"
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = email
            
            # Create login URL
            login_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/login?invite={invite_token}"
            
            # Corporate-friendly text content
            text_content = f"""
Dear Colleague,

You have been granted access to VersionIntel, a cybersecurity intelligence platform.

Access Details:
- Platform: VersionIntel Security Platform
- Role: {role.title()}
- Invited by: {inviter_name}
- Access URL: {login_url}

This invitation expires in 7 days.

If you have any questions, please contact your system administrator.

Best regards,
VersionIntel Security Team
            """.strip()
            
            # Corporate-friendly HTML content
            html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VersionIntel Platform Access</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }}
        .container {{
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e9ecef;
        }}
        .logo {{
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }}
        .content {{
            margin-bottom: 30px;
        }}
        .access-details {{
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }}
        .detail-row {{
            margin-bottom: 10px;
        }}
        .detail-label {{
            font-weight: bold;
            color: #495057;
        }}
        .cta-button {{
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }}
        .footer {{
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            font-size: 14px;
            color: #6c757d;
            text-align: center;
        }}
        .warning {{
            background: #fff3cd;
            border: 1px solid #ffeaa7;
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
            <div>Cybersecurity Intelligence Platform</div>
        </div>
        
        <div class="content">
            <h2>Platform Access Granted</h2>
            <p>Dear Colleague,</p>
            <p>You have been granted access to VersionIntel, a comprehensive cybersecurity intelligence platform for version detection and vulnerability analysis.</p>
            
            <div class="access-details">
                <div class="detail-row">
                    <span class="detail-label">Platform:</span> VersionIntel Security Platform
                </div>
                <div class="detail-row">
                    <span class="detail-label">Role:</span> {role.title()}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Invited by:</span> {inviter_name}
                </div>
            </div>
            
            <div class="warning">
                <strong>⚠️ Important:</strong> This invitation will expire in 7 days.
            </div>
            
            <div style="text-align: center;">
                <a href="{login_url}" class="cta-button">Access Platform</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">{login_url}</p>
        </div>
        
        <div class="footer">
            <p>If you have any questions, please contact your system administrator.</p>
            <p>Best regards,<br>VersionIntel Security Team</p>
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
            
            logger.info(f"Corporate-friendly invitation email sent successfully to {email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send corporate-friendly invitation email to {email}: {str(e)}")
            return False
