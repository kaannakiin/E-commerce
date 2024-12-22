// utils/email.ts

import nodemailer from "nodemailer";

interface EmailConfig {
  host?: string;
  name?: string;
  port?: number;
  secure?: boolean;
  auth: {
    user: string;
    pass: string;
  };
  tls?: {
    rejectUnauthorized: boolean;
  };
}

const defaultConfig: EmailConfig = {
  host: process.env.EMAIL_HOST,
  name: process.env.EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.ADMIN_EMAIL!,
    pass: process.env.ADMIN_PASSWORD!,
  },
  tls: { rejectUnauthorized: false },
};

export function createTransporter(customConfig?: Partial<EmailConfig>) {
  const config = {
    ...defaultConfig,
    ...customConfig,
    auth: {
      ...defaultConfig.auth,
      ...customConfig?.auth,
    },
    tls: {
      ...defaultConfig.tls,
      ...customConfig?.tls,
    },
  };

  return nodemailer.createTransport(config);
}
