import { db, error, json, router, secrets } from '@appdeploy/sdk';

// Sanitized backend mirror for the AppDeploy ERP.
// The live backend runs on AppDeploy app da576bb73e987a3493.
// Configure these secrets in AppDeploy instead of hardcoding credentials:
// - ERP_ADMIN_PASSWORD
// - ERP_CALLCENTER_PASSWORD
// - RESEND_API_KEY

const ORDERS = 'healthy_life_orders';
const INVENTORY = 'healthy_life_inventory';
const SESSIONS = 'healthy_life_sessions';
const CUSTOMER_LIST = 'healthy_life_customer_list';
const STAFF_LOG = 'healthy_life_staff_log';
const COURIERS = 'healthy_life_couriers';

export const handler = router({
  'GET /api/_healthcheck': [async () => json({ message: 'Success', app: 'Healthy Life ERP' })],
  'GET /api/erp/source-info': [async () => {
    const secretNames = await secrets.listSecretNames();
    return json({
      appId: 'da576bb73e987a3493',
      storage: { ORDERS, INVENTORY, SESSIONS, CUSTOMER_LIST, STAFF_LOG, COURIERS },
      configuredSecrets: secretNames.filter(name => ['ERP_ADMIN_PASSWORD', 'ERP_CALLCENTER_PASSWORD', 'RESEND_API_KEY'].includes(name)),
      note: 'Full live routes are deployed in AppDeploy. This GitHub file is sanitized to avoid exposing credentials.'
    });
  }],
  'POST /api/orders': [async () => error('Use the live AppDeploy endpoint for order creation.', 400)],
  'POST /api/erp/login': [async () => error('Use the live AppDeploy endpoint for ERP login.', 400)],
  'POST /api/erp/orders': [async () => error('Use the live AppDeploy endpoint for ERP orders.', 400)],
});
