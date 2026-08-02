import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Velnox database...');

  // --- Admin user ---
  const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@velnox.dev' },
    update: {},
    create: {
      email: 'admin@velnox.dev',
      passwordHash: adminPasswordHash,
      name: 'Velnox Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log(`Seeded admin user: ${admin.email}`);

  // --- Categories ---
  const categoryNames = ['อาหารและเครื่องดื่ม', 'ของใช้ในบ้าน', 'สุขภาพและความงาม'];
  const categories = [];
  for (const name of categoryNames) {
    const slug = name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9\u0E00-\u0E7F]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug, status: 'ACTIVE' },
    });
    categories.push(category);
  }
  console.log(`Seeded ${categories.length} categories`);

  // --- Demo merchant + shop ---
  const merchantPasswordHash = await bcrypt.hash('Merchant@12345', 10);
  const merchantUser = await prisma.user.upsert({
    where: { email: 'merchant@velnox.dev' },
    update: {},
    create: {
      email: 'merchant@velnox.dev',
      passwordHash: merchantPasswordHash,
      name: 'Demo Merchant',
      role: 'MERCHANT',
      status: 'ACTIVE',
    },
  });

  const merchant = await prisma.merchant.upsert({
    where: { userId: merchantUser.id },
    update: {},
    create: {
      userId: merchantUser.id,
      status: 'APPROVED',
      approvedAt: new Date(),
    },
  });

  let shop = await prisma.shop.findFirst({ where: { merchantId: merchant.id } });
  if (!shop) {
    shop = await prisma.shop.create({
      data: {
        merchantId: merchant.id,
        name: 'Velnox Demo Shop',
        description: 'ร้านค้าตัวอย่างสำหรับทดสอบระบบ',
        status: 'ACTIVE',
      },
    });
  }
  console.log(`Seeded demo merchant/shop: ${shop.name}`);

  // --- Demo products ---
  const demoProducts = [
    { name: 'ข้าวหอมมะลิ 5kg', price: 199.0, stock: 100 },
    { name: 'น้ำดื่มแพ็ค 12 ขวด', price: 89.0, stock: 200 },
    { name: 'สบู่อาบน้ำสมุนไพร', price: 45.0, stock: 150 },
  ];

  for (const p of demoProducts) {
    const slug = p.name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9\u0E00-\u0E7F]+/g, '-')
      .replace(/(^-|-$)/g, '');
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        shopId: shop.id,
        categoryId: categories[0].id,
        name: p.name,
        slug,
        price: p.price,
        stock: p.stock,
        status: 'ACTIVE',
        inventory: {
          create: { quantity: p.stock, reservedQuantity: 0 },
        },
      },
    });
  }
  console.log(`Seeded ${demoProducts.length} demo products`);

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
