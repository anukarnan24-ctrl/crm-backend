# Installation Guide

This document explains how to install, configure, and run the **CRM Backend** locally.

---

## Prerequisites

Make sure you have the following installed:

- **Node.js** v20 or later
- **npm** or **yarn**
- A database (PostgreSQL / MySQL / SQLite)
- **Git**

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd crm-backend
```

## 2. Install Dependencies

```bash
npm install
```
## 3. Enviroment Setup

create .env file in project root and add this env values

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/crm
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=7d
PORT=4000
```

## 4. Database Setup

```bash
npx prisma migrate deploy
npx prisma generate
```

## 5. Create Admin user(Seeder)

```bash
npm run seed:admin
```

## 6. Start the server

```bash
npm run dev #in dev enviroment
npm run start #in production enviroment
```
