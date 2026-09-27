import { json, clearSessionCookie } from '../../_lib.js';

export const onRequestPost = () => json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie() });
