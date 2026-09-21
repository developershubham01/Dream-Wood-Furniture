# 🛋️ Dream Wood Furniture

> **Premium Solid-Wood & Custom Furniture Platform** — Crafted for Dream Wood Furniture Showroom in Seawoods, Navi Mumbai.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)

---

## ✨ Features

### 🛒 Customer Storefront
- **Interactive Catalogue**: Explore living room, sofas, beds, wardrobes, dining sets, TV units, coffee tables, study desks, and bespoke custom furniture.
- **Product Quick View & Lightbox**: High-resolution gallery preview, detailed dimensions, material specifications, and color variants.
- **Product Comparison Tool**: Side-by-side comparison tray for comparing features, sizes, and pricing across multiple pieces.
- **Bespoke Custom Furniture Request**: Dedicated enquiry workflow allowing customers to upload requirements and select wood types, finishes, and dimensions.
- **Wishlist & Recently Viewed**: Client-side persistent storage for saving favorite items and browsing history.
- **Direct WhatsApp & Phone Integration**: Instant floating WhatsApp action button and quick quotation request form.
- **Showroom Info & FAQs**: Interactive FAQ accordion, live open/closed status badge, and store location guide (Seawoods West, Navi Mumbai).

### 🔐 Admin Dashboard Management
- **Overview Analytics**: Real-time stats on total products, active enquiries, category distribution, and store metrics.
- **Catalogue Manager**: Create, edit, feature, or toggle availability of products and categories.
- **Enquiry Manager**: Track customer enquiries, update lead status (*New*, *Contacted*, *Quoted*, *Won*, *Archived*), and add internal notes.
- **Content & Testimonials**: Manage customer reviews, storefront banner announcements, and site settings.
- **Security & Auth**: Secure credential-based admin login with session management.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions & Turbopack)
- **Frontend Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Design System
- **UI Components**: Radix UI Primitives, Lucide Icons, Framer Motion animations
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with SQLite database
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Visualization**: Recharts (Admin overview charts)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/developershubham01/Dream-Wood-Furniture.git
   cd Dream-Wood-Furniture
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create or verify `.env` file in the root directory:
   ```env
   DATABASE_URL="file:../db/custom.db"
   ```

4. **Initialize Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server on port 3000 |
| `npm run build` | Builds optimized production bundle |
| `npm run start` | Runs production build server |
| `npx prisma generate` | Generates Prisma client types |
| `npx prisma db push` | Syncs Prisma schema with SQLite database |

---

## 📁 Directory Structure

```text
├── db/                    # SQLite database storage (custom.db)
├── prisma/                # Prisma schema definition
├── public/                # Static assets, branding logos & furniture imagery
├── scripts/               # Seeding & database utility scripts
├── src/
│   ├── app/               # Next.js App Router (pages & API routes)
│   ├── components/
│   │   ├── site/          # Storefront views, Navbar, Footer, Admin views
│   │   └── ui/            # Reusable UI component library (Button, Dialog, etc.)
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utility functions, Prisma DB client & Zustand store
├── package.json
└── README.md
```

---

## 🏷️ Admin Credentials

Default credentials set in seeder (`scripts/seed.ts`):
- **Username**: `admin`
- **Password**: `dreamwood2025`

*(Note: Change admin credentials via Admin Security Settings after first login)*

---

## 📄 License

This project is maintained for **Dream Wood Furniture**. All rights reserved.
