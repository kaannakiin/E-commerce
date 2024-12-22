import { OrderItems } from "@prisma/client";

interface EmailContent {
  content: string;
  buttonText?: string;
  buttonLink?: string;
}

export const generateEmailTemplate = ({
  content,
  buttonText,
  buttonLink,
}: EmailContent): string => {
  return `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Terra Viva</title>
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
    
    @media only screen and (min-width: 620px) {
      .u-row { width: 600px !important; }
      .u-row .u-col { vertical-align: top; }
      .u-row .u-col-100 { width: 600px !important; }
    }
    
    @media (max-width: 620px) {
      .u-row-container { max-width: 100% !important; padding: 0 !important; }
      .u-row .u-col { min-width: 320px !important; max-width: 100% !important; display: block !important; }
      .u-row { width: 100% !important; }
      .u-col { width: 100% !important; }
      .u-col > div { margin: 0 auto; }
    }
    
    body { margin: 0; padding: 0; }
    table, tr, td { vertical-align: top; border-collapse: collapse; }
    p { margin: 0; }
    * { line-height: inherit; font-family: 'Poppins', Arial, sans-serif; }
  </style>
</head>

<body style="margin: 0;padding: 0;background-color: #f5f5f5;">
  <table style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;vertical-align: top;min-width: 320px;margin: 0 auto;background-color: #f5f5f5;width:100%" cellpadding="0" cellspacing="0">
    <tbody>
      <tr style="vertical-align: top">
        <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">

          <!-- Header / Logo -->
          <div style="padding: 20px 0;background: #ffffff;">
            <div style="margin: 0 auto;min-width: 320px;max-width: 600px;">
              <div style="padding: 20px;text-align: center;">
                <img src="https://assets.unlayer.com/projects/258519/1732780778432-TERRA%20VIVA.png" alt="Terra Viva" style="width: 180px;max-width: 100%;height: auto;">
              </div>
            </div>
          </div>

          <!-- İçerik Alanı -->
          <div style="padding: 0;background-color: transparent;">
            <div style="margin: 0 auto;min-width: 320px;max-width: 600px;">
              <div style="background-color: #ffffff;border-radius: 10px;box-shadow: 0 4px 6px rgba(0,0,0,0.1);margin: 0 20px;padding: 40px;text-align: center;">
                <!-- Dinamik içerik başlangıcı -->
                ${content}
                
                ${
                  buttonText && buttonLink
                    ? `
                <!-- Buton -->
                <div style="margin: 35px 0;">
                  <a href="${buttonLink}" 
                     target="_blank"
                     style="background-color: #00796B;
                            color: #FFFFFF;
                            padding: 16px 48px;
                            text-decoration: none;
                            border-radius: 50px;
                            display: inline-block;
                            font-weight: 600;
                            font-size: 16px;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            box-shadow: 0 4px 15px rgba(0,121,107,0.2);">
                    ${buttonText}
                  </a>
                </div>
                `
                    : ""
                }
                <!-- Dinamik içerik bitişi -->
              </div>
            </div>
          </div>

          <!-- İletişim Bilgileri -->
          <div style="padding: 40px 0;background-color: transparent;">
            <div style="margin: 0 auto;min-width: 320px;max-width: 600px;">
              <div style="background-color: #ffffff;border-radius: 10px;box-shadow: 0 4px 6px rgba(0,0,0,0.1);margin: 0 20px;padding: 30px;text-align: center;">
                <div style="color: #00796B;font-size: 22px;font-weight: 600;margin-bottom: 20px;">
                  Bizimle İletişime Geçin
                </div>
                <div style="font-size: 16px;margin-bottom: 10px;color: #4a4a4a;">+90 555 555 55 55</div>
                <div style="font-size: 16px;color: #4a4a4a;">Info@terravivashop.com</div>
                
                <!-- Sosyal Medya İkonları -->
                <div style="margin-top: 30px;">
                  <a href="#" style="margin: 0 8px;text-decoration: none;display: inline-block;">
                    <img src="https://cdn.tools.unlayer.com/social/icons/circle-black/instagram.png" alt="Instagram" width="36">
                  </a>
                  <a href="#" style="margin: 0 8px;text-decoration: none;display: inline-block;">
                    <img src="https://cdn.tools.unlayer.com/social/icons/circle-black/email.png" alt="Email" width="36">
                  </a>
                  <a href="#" style="margin: 0 8px;text-decoration: none;display: inline-block;">
                    <img src="https://cdn.tools.unlayer.com/social/icons/circle-black/whatsapp.png" alt="WhatsApp" width="36">
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 20px 0;background-color: #00796B;">
            <div style="margin: 0 auto;min-width: 320px;max-width: 600px;">
              <div style="padding: 15px;text-align: center;color: #ffffff;">
                <div style="font-size: 14px;font-weight: 500;letter-spacing: 0.5px;">
                  © ${new Date().getFullYear()} Terra Viva - Tüm Hakları Saklıdır
                </div>
              </div>
            </div>
          </div>

        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;
};

export const generateRefundEmailContent = (
  totalPrice: number,
  siparisNo: string,
) => {
  return `
<div style="background-color: #f5fff5; padding: 24px; border-radius: 8px; max-width: 800px;">
  <div style="margin-bottom: 20px;">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="19" stroke="#00a046" stroke-width="2"/>
      <path d="M12 20L17 25L28 14" stroke="#00a046" stroke-width="2" stroke-linecap="round"/>
    </svg>
  </div>
  
  <h2 style="color: #00a046; font-size: 24px; margin-bottom: 16px; font-weight: 500;">
    İade işleminiz gerçekleşti
  </h2>
  
  <div style="font-size: 16px; line-height: 1.5; color: #484848;">
    <strong>${totalPrice}</strong> tutarındaki iade işleminiz tamamlandı. İade tutarı 3 iş günü içerisinde hesabınıza yansıyacaktır.
  </div>
 <a href="${process.env.NEXT_PUBLIC_APP_URL}/siparis?orderNumber=${siparisNo}&status=basarili" style="text-decoration: underline; color: #484848; font-size: 14px;">
    İade detaylarını görüntüle
  </a>
</div>
`;
};
export const generateOrderConfirmationContent = (
  paidPrice: number,
  orderNumber: string,
  products: {
    name: string;
    price: number;
    image: string;
    quantity: number;
  }[],
) => {
  const productsList = products
    .map(
      (product) => `
   <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: #fff; border-radius: 8px; margin-bottom: 12px;">
 <div style="position: relative;">
   <img src="${product.image}" alt="${product.name}" style="width: 80px; height: 80px; object-fit: contain; border-radius: 4px;">
   <div style="position: absolute; top: -8px; right: -8px; background: #00796B; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
     ${product.quantity}x
   </div>
 </div>
 <div>
   <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #484848;">${product.name}</h3>
   <p style="margin: 0; font-weight: 600; font-size: 16px;">${product.price.toLocaleString("tr-TR")} TL</p>
 </div>
</div>
  `,
    )
    .join("");

  return `
<div style="background-color: #f5fff5; padding: 24px; border-radius: 8px; max-width: 800px;">
  <div style="margin-bottom: 20px;">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="19" stroke="#00a046" stroke-width="2"/>
      <path d="M12 20L17 25L28 14" stroke="#00a046" stroke-width="2" stroke-linecap="round"/>
    </svg>
  </div>
  
  <h2 style="color: #00a046; font-size: 24px; margin-bottom: 16px; font-weight: 500;">
    Siparişiniz başarıyla oluşturuldu
  </h2>
  
  <div style="font-size: 16px; line-height: 1.5; color: #484848; margin-bottom: 24px;">
    <strong>${paidPrice.toLocaleString("tr-TR")} TL</strong> tutarındaki siparişiniz başarıyla oluşturuldu. Siparişinizin durumunu takip edebilirsiniz.
  </div>

  <div style="background-color: #fff; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
    <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #484848;">Ürünleriniz</h3>
    ${productsList}
  </div>
  
  <a href="${process.env.NEXT_PUBLIC_APP_URL}/siparis?orderNumber=${orderNumber}&status=basarili" 
     style="text-decoration: underline; color: #484848; font-size: 14px;">
    Sipariş detaylarını görüntüle
  </a>
</div>
`;
};
