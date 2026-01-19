export const ALLOWED_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
