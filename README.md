<div align="center">
  <img src="https://i.ibb.co/8WzWcNn/unifynt.png" alt="Unifynt Logo" width="120" />
  <h1>Unifynt Client — Next.js Frontend</h1>
  <p><strong>A Modern, Multi-Tenant SaaS School Management System (Frontend)</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Shadcn_UI-000000?logo=shadcnui&logoColor=white" alt="Shadcn UI" />
  </p>
</div>

---

## 🚀 Overview

The **Unifynt Client** is a highly scalable, multi-tenant frontend application built with **Next.js**. It serves as the primary interface for School Administrators, Teachers, Students, Parents, and Super Admins. Designed with a focus on performance, accessibility, and modern aesthetics, it utilizes the power of Server Components and an elegant UI system.

## ✨ Key Features

- **Multi-Tenant Architecture**: Dynamic routing based on subdomains (e.g., `school1.unifynt.com`) using Next.js middleware.
- **Role-Based Dashboards**: Distinct, permission-driven dashboards for different roles (Super Admin, School Admin, Teacher, Student, Accountant).
- **Real-Time Capabilities**: Integrated with Socket.io for instant notifications and updates.
- **Enterprise-Grade UI**: Built on top of **Tailwind CSS** and **Shadcn UI** for a consistent, accessible, and highly customizable design language.
- **Advanced State Management**: Utilizes `@tanstack/react-query` for server state and caching, and robust form handling with `react-hook-form` + `zod`.

## 🛠️ Technology Stack

| Category            | Technology           | Description                                                |
| :------------------ | :------------------- | :--------------------------------------------------------- |
| **Framework**       | Next.js (App Router) | React framework for production                             |
| **Language**        | TypeScript           | Strongly typed programming language                        |
| **Styling**         | Tailwind CSS         | Utility-first CSS framework                                |
| **Components**      | Shadcn UI, Radix UI  | Accessible, unstyled React components                      |
| **Data Fetching**   | React Query, Axios   | Powerful asynchronous state management                     |
| **Form Management** | React Hook Form, Zod | Performant, flexible, and extensible forms with validation |
| **Real-time**       | Socket.io-client     | Bi-directional real-time communication                     |

## 📂 Project Structure

```text
unifynt/
├── public/                 # Static assets (images, fonts, etc.)
├── src/
│   ├── app/                # Next.js App Router (Pages, Layouts, API routes)
│   │   ├── (auth)/         # Authentication routes (Login, Register)
│   │   ├── (dashboard)/    # Admin & User Dashboards
│   │   ├── sites/          # Multi-tenant public sites routing ([domain])
│   │   ├── globals.css     # Global styles and Tailwind directives
│   │   └── layout.tsx      # Root layout component
│   ├── components/         # Reusable React components
│   │   ├── core/           # Core/Shared UI components (e.g., tables, cards)
│   │   ├── forms/          # Form-specific components
│   │   ├── layout/         # Layout components (Header, Sidebar, Footer)
│   │   └── ui/             # Shadcn UI library components
│   ├── config/             # Application constants, navigation maps, env variables
│   ├── context/            # React Context Providers (e.g., AuthProvider, SocketProvider)
│   ├── hooks/              # Custom React hooks (e.g., useAuth, useDebounce)
│   ├── lib/                # Utility functions, API clients, helpers (e.g., utils.ts)
│   ├── providers/          # Global application providers (QueryClient, Theme)
│   ├── services/           # API service modules to interact with the backend
│   └── types/              # TypeScript interface and type definitions
├── .env.local              # Local environment variables
├── components.json         # Shadcn config
├── next.config.mjs         # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## ⚙️ Architecture Diagram

```mermaid
graph TD
    User([End User]) --> |HTTPS Request| Middleware[Next.js Middleware]
    Middleware --> |Subdomain Routing| Sites[Public Sites `src/app/sites`]
    Middleware --> |Auth Routing| App[App Router Dashboard `src/app/(dashboard)`]

    App --> Components[UI Components]
    App --> State[React Query / Services]

    State --> |Axios Requests| Backend[(Unifynt Core API)]
    State --> |Socket.io| WSS[(Real-time Server)]
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn or pnpm

### Installation

1. **Clone the repository and navigate to the client folder:**

   ```bash
   cd unifynt
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory and add the necessary environment variables:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## 🎨 UI/UX Philosophy

The frontend is designed with a "Premium Enterprise" feel.

- **Glassmorphism & Gradients:** Subtle use of blur effects and modern gradients for depth.
- **Responsive by Default:** Ensures pixel-perfect layouts across mobile, tablet, and desktop viewports.
- **Micro-interactions:** Smooth animations using `framer-motion` and native CSS transitions to provide user feedback.

## 🛡️ Security & Performance

- **Server-Side Rendering (SSR) & Static Site Generation (SSG)** used strategically for performance and SEO (for public sites).
- **Middleware Protections** for route guarding and session validation.
- **Optimistic UI Updates** via React Query to ensure a snappy user experience.

---

<p align="center">Made with ❤️ by the Unifynt Team</p>
