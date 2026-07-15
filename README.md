# Uncommon Clothing E-Commerce Shop

A premium, modern e-commerce clothing shop built with a robust React/Vite frontend and a serverless Node.js/Supabase backend.

---

## 🚀 Features

*   **Premium Storefront**: Sleek typography, minimalist styling, dynamic cart, product details, and seamless checkout.
*   **RBAC Admin Panel**: Secure, role-based admin dashboard to manage products, categories, orders, discount codes, users, and store settings.
*   **Dynamic Order Tracking**: Order creation with customer-isolated tracking (users only see their own orders; admins see all orders).
*   **Supabase Storage CDN**: Image upload with automatic bucket validation and real-time public URL mapping.
*   **Local Serverless Environment**: Dev server routing `/api` functions to a lightweight local Node.js proxy.

---

## 🛠️ Tech Stack

*   **Frontend**: React 19, Vite, TypeScript, TailwindCSS, Framer Motion, Lucide Icons
*   **Backend**: Node.js ESM serverless handlers (Vercel standard)
*   **Database & Auth**: Supabase (PostgreSQL, Row-Level-Security, Auth Identities)
*   **Local Dev API Host**: Custom ESM dynamic module loader (port 3000)

---

## 📁 Database Schema (Supabase)

*   `categories`: Store departments (Men, Women, Accessories, etc.)
*   `products`: Main product records (prices, inventory, sizes, colors)
*   `product_images`: Support for multiple high-res product photos
*   `discounts`: Coupon codes, start/end dates, and percentage rates
*   `orders` & `order_items`: Order records, billing details, and item breakdowns
*   `settings`: Dynamic storefront variables (currencies, email SMTP, feature toggles)
*   `user_roles`: RBAC table mapping user UUIDs to roles (`admin` / `customer`)

---

## ⚙️ Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (`.env`)
Create a `.env` file at the root of the project:
```env
# Frontend Supabase Config
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend Server Config
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SECRET_KEY=your-service-role-key
FULLSTACK_PROJECT_REF=your-project-ref
```

---

## 💻 Running Locally

To run the full stack locally:

### 1. Start the API Backend
```bash
node api-server.js
```
*Runs on `http://localhost:3000`*

### 2. Start the Vite Frontend
```bash
npm run dev
```
*Runs on `http://localhost:5173` (requests to `/api/*` are proxied to port 3000)*
