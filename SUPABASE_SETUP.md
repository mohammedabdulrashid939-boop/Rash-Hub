# RASH HUB STORE — SUPABASE & SYSTEM SETUP GUIDE

This document explains how to connect and configure your live Supabase backend for **Rash Hub Store** (Abofour, Ghana).

---

## 1. Connect Your Supabase Project

1. Go to [supabase.com](https://supabase.com) and create or open your project.
2. In your Supabase dashboard, navigate to **Project Settings** → **API**.
3. Copy your **Project URL** and **anon / public** key.
4. Set them in your environment:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   *Alternative:* You can also click the **"Supabase Config"** badge in the website header or Admin Dashboard to enter them directly.

---

## 2. Apply Database Migrations & Row Level Security (RLS)

1. Open **SQL Editor** in your Supabase dashboard.
2. Open the file `supabase/migrations/20261023_init_schema.sql` (or copy it directly from the Admin Dashboard in the app).
3. Paste the SQL into the Supabase SQL Editor and click **Run**.
4. This creates:
   - `profiles` table (linked to `auth.users`)
   - `products` table
   - `product_images` table
   - `product_sizes` table
   - `orders` table (with Abofour delivery enforcement)
   - `order_items` table
   - Automated user profile creation trigger (`handle_new_user()`)
   - Strict Row Level Security (RLS) policies on all tables
   - `jersey-images` public storage bucket and policies

---

## 3. Storage Bucket Configuration

The SQL migration automatically initializes the storage bucket:
- **Bucket name:** `jersey-images`
- **Public:** `true` (allows fast CDN image loading for football fans)
- **RLS:** Only authenticated administrators can upload, update, and delete jersey photos. Public visitors can view images.

---

## 4. Configure Authentication & Redirect URLs

1. In Supabase, go to **Authentication** → **URL Configuration**.
2. Set **Site URL** to your production or development URL:
   - Development: `https://ais-dev-43xgjykrp3bnfbrt26zdgc-847285316587.europe-west2.run.app` or `http://localhost:3000`
3. In **Redirect URLs**, add:
   - `http://localhost:3000/**`
   - `https://ais-dev-43xgjykrp3bnfbrt26zdgc-847285316587.europe-west2.run.app/**`
   - `https://ais-pre-43xgjykrp3bnfbrt26zdgc-847285316587.europe-west2.run.app/**`
   - `/reset-password`
   - `/login`

---

## 5. Email Verification & Password Recovery

1. In Supabase, go to **Authentication** → **Email Templates**.
2. **Confirm signup:** Contains `{{ .ConfirmationURL }}` directing the user back to `/login`.
3. **Reset password:** Contains `{{ .ConfirmationURL }}` directing the user back to `/reset-password`.
4. If using Supabase free tier email, rate limits apply (3-4 emails per hour). For production, configure custom SMTP (e.g. Resend, SendGrid, Amazon SES) in **Authentication** → **SMTP Settings**.

---

## 6. Securely Assign the First Administrator

Ordinary customer registrations will always default to `role = 'customer'` (preventing unauthorized privilege escalation).

To make an account an administrator:
1. Register your account on the store at `/signup` (e.g. `your-email@example.com`).
2. Go to the Supabase **SQL Editor** and run:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'your-email@example.com';
   ```
3. Refresh your Rash Hub Store page. The **Admin** button will now be active in the header, granting access to the Jersey Upload Studio and Order Management!

---

## 7. Business & Ordering Details

- **Store Name:** Rash Hub Store
- **Business:** Football jerseys only
- **Currency:** Ghana Cedis (GH₵)
- **Phone:** 0533916516 (`tel:0533916516`)
- **WhatsApp:** +233533916516 (`wa.me/233533916516`)
- **Delivery Territory:** Abofour, Ghana only (1 to 3 hour local dispatch)
- **Official Brand Logo:** Installed in `public/logo.png`
