import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

export const isResendConfigured = Boolean(resendApiKey);

export const resend: Resend | null = isResendConfigured ? new Resend(resendApiKey) : null;
