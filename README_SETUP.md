# Velnox Marketplace Platform - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 24.0.0+
- pnpm 9.0.0+
- PostgreSQL 14+
- Cloudinary Account (for image uploads)

### Installation

1. **Install dependencies**
```bash
pnpm install
```

2. **Setup Backend**
```bash
cd backend
cp .env.example .env
# Edit .env with your database and Cloudinary credentials
pnpm db:migrate
pnpm db:seed
pnpm dev
```

3. **Setup Frontend Apps**
```bash
# Terminal 2
cd apps/shop
pnpm dev
# Visit http://localhost:3000

# Terminal 3
cd apps/merchant
pnpm dev
# Visit http://localhost:3001

# Terminal 4
cd apps/center
pnpm dev
# Visit http://localhost:3002
```

## 📚 Test Credentials

### Customer (VelShop)
- Email: `customer@velnox.dev`
- Password: `Customer@12345`

### Merchant (VelMerchant)
- Email: `merchant@velnox.dev`
- Password: `Merchant@12345`

### Admin (VelCenter)
- Email: `admin@velnox.dev`
- Password: `Admin@12345`

## 🏗️ Project Structure

```
velnox/
├── apps/
│   ├── shop/          # Customer Marketplace
│   ├── merchant/      # Merchant Portal
│   └── center/        # Admin Management
├── backend/           # NestJS API
├── packages/
│   ├── api-client/    # Shared API Client
│   ├── types/         # TypeScript Types
│   ├── ui/            # Shared UI Components
│   ├── i18n/          # Internationalization
│   └── config/        # Shared Config
└── docs/              # Documentation
```

## 🔑 Key Features

✅ **VelShop** - Customer Marketplace
- Product browsing and search
- Shopping cart and checkout
- Order tracking
- VelRepeat subscription management
- User profile and address management

✅ **VelMerchant** - Merchant Portal
- Shop management
- Product management with image uploads
- Order management
- Revenue analytics
- VelRepeat insights

✅ **VelCenter** - Admin Management
- User management
- Merchant approval system
- Product monitoring
- Platform analytics
- System health monitoring

## 🔗 API Endpoints

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

### Products
- `GET /products` - List products
- `GET /products/:id` - Get product details
- `GET /products/slug/:slug` - Get by slug

### Cart
- `GET /cart` - Get cart
- `POST /cart/items` - Add to cart
- `PATCH /cart/items/:id` - Update cart item
- `DELETE /cart/items/:id` - Remove from cart

### Orders
- `POST /orders` - Create order
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order details

### VelRepeat
- `POST /velrepeat` - Create subscription
- `GET /velrepeat` - Get subscriptions
- `PATCH /velrepeat/:id` - Update subscription
- `DELETE /velrepeat/:id` - Cancel subscription

### Uploads
- `POST /uploads/image` - Upload image

## 🎨 Theme Colors (Mint Blue)

- Primary: `#4FD1C5` (Mint Blue)
- Primary Light: `#B2F5EA`
- Primary Dark: `#319795`
- Secondary: `#2D3748` (Deep Slate)
- Background: `#F7FAFC`

## 📦 Build & Deploy

```bash
# Build all apps
pnpm build

# Deploy to production
# Frontend: Vercel
# Backend: Railway or Cloud Server
# Database: Neon PostgreSQL
# Storage: Cloudinary
```

## 📖 Documentation

See `/docs` folder for detailed documentation:
- 01_Project_Overview.md
- 02_System_Architecture.md
- 12_Database_Design.md
- 13_API_Specification.md
- 14_Coding_Standards.md
- 15_Security_Architecture.md

## 🤝 Support

For issues or questions, please refer to the documentation or create an issue in the repository.

---

**Version:** 1.0.0  
**Last Updated:** July 2026  
**Status:** Production Ready
