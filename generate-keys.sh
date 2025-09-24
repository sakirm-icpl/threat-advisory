#!/bin/bash
# Generate Secure Keys for VersionIntel Production

# Check for Python availability
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "Error: Python is not installed or not in PATH"
    echo "Please install Python 3 and try again"
    echo "Ubuntu/Debian: sudo apt update && sudo apt install python3"
    echo "CentOS/RHEL: sudo yum install python3"
    exit 1
fi

echo "Generating secure keys for VersionIntel production deployment..."
echo ""

# Generate SECRET_KEY (64 characters)
echo "SECRET_KEY for .env file:"
$PYTHON_CMD -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"
echo ""

# Generate JWT_SECRET_KEY (64 characters)  
echo "JWT_SECRET_KEY for .env file:"
$PYTHON_CMD -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_hex(32))"
echo ""

# Generate secure database password
echo "Secure database password suggestion:"
$PYTHON_CMD -c "import secrets, string; chars = string.ascii_letters + string.digits + '!@#$%^&*'; print('POSTGRES_PASSWORD=' + ''.join(secrets.choice(chars) for i in range(32)))"
echo ""

echo "Copy these values to your .env file, replacing the CHANGE_THIS_* placeholders"
echo "Make sure to keep these keys secure and never commit them to version control!"