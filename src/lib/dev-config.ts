/**
 * Development configuration to allow testing the application 
 * features without a functional Clerk instance.
 * 
 * Set BYPASS_AUTH to true to skip Clerk checks.
 */
export const DEV_CONFIG = {
    BYPASS_AUTH: false, // Toggle this to true/false
    MOCK_TENANT_ID: 'mock_tenant_dev_123',
};
