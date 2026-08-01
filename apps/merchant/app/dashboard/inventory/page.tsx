'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@velnox/ui';
import { productService } from '@/services/merchant.service';

interface Product {
  id: string;
  name: string;
  stock: number;
  status: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    productService
      .listMine()
      .then((data) => setProducts(data as Product[]))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleStockChange(id: string, stock: number) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock } : p)));
  }

  async function handleSave(id: string, stock: number) {
    setSavingId(id);
    try {
      await productService.update(id, { stock });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">คลังสินค้า</h1>
      <p className="mt-1 text-sm text-ink/60">ปรับจำนวนสต็อกสินค้าได้โดยตรง — บันทึกอัตโนมัติเมื่อออกจากช่อง</p>

      <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white">
        {isLoading ? (
          <p className="p-6 text-sm text-ink/50">กำลังโหลด...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium">สินค้า</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium">สต็อก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">
                    <Badge tone={product.stock <= 5 ? 'brick' : 'success'}>
                      {product.stock <= 5 ? 'ใกล้หมด' : 'ปกติ'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      value={product.stock}
                      onChange={(e) => handleStockChange(product.id, Number(e.target.value))}
                      onBlur={(e) => handleSave(product.id, Number(e.target.value))}
                      className="w-24 rounded-md border border-line px-2 py-1 font-mono text-sm focus:border-teal focus:outline-none"
                    />
                    {savingId === product.id && (
                      <span className="ml-2 text-xs text-ink/40">กำลังบันทึก...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
