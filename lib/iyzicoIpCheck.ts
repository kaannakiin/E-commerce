const IYZICO_ALLOWED_IPS = {
  notification: {
    current: ["85.111.48.36", "85.111.9.165"], // Mevcut Production ve Disaster IP'leri
    new: ["213.226.118.16", "193.142.35.16", "213.226.118.95"], // Yeni Production ve Disaster IP'leri
  },
};

export const isIyzicoIP = (clientIP: string | null): boolean => {
  if (!clientIP) return false;

  const ip = clientIP.split(",")[0].trim();

  return [
    ...IYZICO_ALLOWED_IPS.notification.current,
    ...IYZICO_ALLOWED_IPS.notification.new,
  ].includes(ip);
};
