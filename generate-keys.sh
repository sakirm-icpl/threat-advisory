# Generate Secure Keys for VersionIntel Production

# Run these commands to generate secure keys for your .env file:

echo "Generating secure keys for VersionIntel production deployment..."
echo ""

# Generate SECRET_KEY (64 characters)
echo "SECRET_KEY for .env file:"
python -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"
echo ""

# Generate JWT_SECRET_KEY (64 characters)  
echo "JWT_SECRET_KEY for .env file:"
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_hex(32))"
echo ""

# Generate secure database password
echo "Secure database password suggestion:"
python -c "import secrets, string; chars = string.ascii_letters + string.digits + '!@#$%^&*'; print('POSTGRES_PASSWORD=' + ''.join(secrets.choice(chars) for i in range(32)))"
echo ""

echo "Copy these values to your .env file, replacing the CHANGE_THIS_* placeholders"
echo "Make sure to keep these keys secure and never commit them to version control!"