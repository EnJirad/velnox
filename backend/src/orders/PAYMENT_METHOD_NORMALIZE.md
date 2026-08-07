ใน createFromCart ก่อน payment.create ใส่:

const methodMap: Record<string, string> = {
  promptpay: 'PROMPTPAY_QR',
  PROMPTPAY: 'PROMPTPAY_QR',
  PROMPTPAY_QR: 'PROMPTPAY_QR',
  card: 'CARD',
  cod: 'COD',
  COD: 'COD',
};
const method = methodMap[paymentMethod] ?? paymentMethod ?? 'PROMPTPAY_QR';

แล้วใช้ method แทน paymentMethod ใน payment.create
