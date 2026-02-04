# CRM Backend (Express + Prisma)

A simple CRM backend API built with **Node.js (ES Modules)**, **Express**, **Prisma**, and **JWT authentication**.  
Supports authentication, leads, contacts, notes, tasks, and a timeline per contact.

---

## Tech Stack

- Node.js (ES Modules)
- Express.js
- Prisma ORM
- JWT Authentication
- bcrypt (password hashing)
- Database: PostgreSQL / MySQL / SQLite (via Prisma)

---

## Features

### 🔐 Authentication
- User signup/login
- Password hashing
- JWT auth
- Protected routes
- Roles: `USER`, `ADMIN`, `DEV`

### 👤 Users
- Get current user profile
- List users (ADMIN/DEV only)
- Ownership tracking for CRM entities

### 🎯 Leads
- Create lead
- Edit lead
- List/search leads
- Filter by status
- Convert lead → contact
- Track conversion timestamp

### 📇 Contacts
- Create contact
- Edit contact
- List/search contacts
- Owner-based access control
- View single contact

### 📝 Notes
- Add note to a contact
- Edit/delete note
- Notes are access-checked via contact ownership

### ✅ Tasks
- Create task linked to a contact
- Due date support
- Mark complete / pending
- List tasks per contact
- List pending tasks

### 🕒 Timeline
- Timeline per contact (notes + tasks merged)
- Owner-based access control

---

## Project Structure

```text
src/
├── controllers/
├── services/
├── routes/
├── middlewares/
├── prisma.js
├── app.js
└── server.js

prisma/
├── schema.prisma
└── migrations/
└── seeders/
