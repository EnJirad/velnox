/**
 * Geo helpers สำหรับที่อยู่จัดส่ง
 *
 * ปัจจุบัน (manual / hybrid):
 *   พิกัดถูกแนบท้าย addressLine เป็น `| GPS:lat,lng`
 *   — ไม่ต้อง migrate DB ทันที
 *
 * อนาคต (auto delivery / แอปขนส่ง):
 *   ย้ายไปคอลัมน์ shippingLat / shippingLng บน Order
 *   และ lat / lng บน Address แล้วเลิก encode ในข้อความ
 *   ฟังก์ชันด้านล่างยังใช้ parse ได้จากข้อมูลเก่า
 *
 * Visibility:
 *   - Shop ลูกค้า: ใส่พิกัดได้ แก้ได้ — ไม่ต้องโชว์ตัวเลข lat/lng
 *   - Merchant: เห็นเฉพาะที่อยู่ข้อความ (stripGeoFromText)
 *   - Center + แอปขนส่ง: ใช้ parseGeoFromText / มีคอลัมน์จริง
 */

export type GeoPoint = { lat: number; lng: number };

const GPS_SUFFIX = /\s*\|\s*GPS:([-\d.]+),([-\d.]+)\s*$/i;

export function parseGeoFromText(text: string | null | undefined): GeoPoint | null {
  if (!text) return null;
  const m = text.match(GPS_SUFFIX);
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

/** ตัดพิกัดออก — ใช้โชว์ให้ลูกค้า/ร้าน */
export function stripGeoFromText(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(GPS_SUFFIX, '').trim();
}

/** แนบพิกัดท้ายข้อความ (รูปแบบปัจจุบัน) */
export function encodeGeoInText(line: string, geo: GeoPoint | null | undefined): string {
  const base = stripGeoFromText(line);
  if (!geo) return base;
  return `${base} | GPS:${geo.lat.toFixed(6)},${geo.lng.toFixed(6)}`;
}

export function hasGeo(text: string | null | undefined): boolean {
  return parseGeoFromText(text) !== null;
}

/** Google Maps / OSM deep link สำหรับ Center / อนาคตแอปส่ง */
export function mapsOpenUrl(geo: GeoPoint): string {
  return `https://www.google.com/maps?q=${geo.lat},${geo.lng}`;
}

export function osmOpenUrl(geo: GeoPoint): string {
  return `https://www.openstreetmap.org/?mlat=${geo.lat}&mlon=${geo.lng}#map=17/${geo.lat}/${geo.lng}`;
}
