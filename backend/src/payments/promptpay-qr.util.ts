/**
 * Dynamic PromptPay QR — สแกนแล้วขึ้นยอดในแอปธนาคาร
 * promptPayId: เบอร์ 10 หลัก หรือเลขบัตร 13 หลัก
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const generatePayload = require('promptpay-qr') as (
  id: string,
  opts: { amount?: number },
) => string;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const QRCode = require('qrcode') as {
  toDataURL: (text: string, opts?: object) => Promise<string>;
};

export async function createPromptPayQrDataUrl(
  promptPayId: string,
  amount: number,
): Promise<{ payload: string; qrDataUrl: string }> {
  const id = String(promptPayId).replace(/\D/g, '');
  if (id.length < 10) {
    throw new Error('Invalid PromptPay ID');
  }
  if (!(amount > 0) || Number.isNaN(amount)) {
    throw new Error('Amount must be greater than 0');
  }

  const rounded = Math.round(amount * 100) / 100;
  const payload = generatePayload(id, { amount: rounded });
  const qrDataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 320,
  });

  return { payload, qrDataUrl };
}
