# Configuration Templates

This directory contains template files for environment configuration. **Never commit actual configuration files with sensitive data to version control.**

## Setup Instructions

1. **Copy templates to actual config directory:**
   ```bash
   cp config.templates/environments/*.template config/environments/
   ```

2. **Rename the files:**
   ```bash
   cd config/environments
   mv development.env.template development.env
   mv production.env.template production.env
   mv staging.env.template staging.env
   mv test.env.template test.env
   ```

3. **Fill in your actual values:**
   - Replace placeholder values with your real configuration
   - Never commit these files with real credentials
   - Use environment variables or secure secret management in production

## Security Best Practices

- ✅ Use environment variables for sensitive data
- ✅ Use secure secret management services (AWS Secrets Manager, HashiCorp Vault, etc.)
- ✅ Rotate secrets regularly
- ✅ Use different secrets for each environment
- ❌ Never commit real passwords or API keys
- ❌ Never share configuration files with sensitive data

## Environment-Specific Notes

### Development
- Use local database instances
- Enable debug mode and hot reload
- Use simple passwords for local development

### Production
- Use strong, unique passwords
- Enable all security features
- Use HTTPS and secure cookies
- Configure proper monitoring and alerting

### Staging
- Mirror production configuration
- Use separate database instances
- Test deployment procedures

### Test
- Use dedicated test database
- Enable test-specific features
- Use mock services where appropriate 