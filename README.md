# FoodSport Frontend

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Setup (Prisma)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env` with your Supabase and Prisma settings.
3. Run migrations:
   ```bash
   npm run m-dev
   # equivalent to npx prisma migrate dev
   ```
4. Start the app:
   ```bash
   npm run dev
   ```

## Environment Variables

 the [`.env.example`](./.env.example) file in the root directory for required environment variables and example values.

## API Documentation
- All API endpoints use Prisma ORM for database operations.
- Supabase Auth is used for authentication.

# Project Structure Proposal: User & Admin Portal Separation

This project contains both the user and admin portals, each with their own frontend (FE) and backend (BE) logic. To improve maintainability, the following structure is proposed:

```
root/
│
├── prisma/                  # Prisma schema and migrations
│   ├── schema.prisma
│   └── migrations/
├── public/                  # Static assets (images, svgs, etc.)
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
│   └── utils/
├── src/                     # Main source code
│   ├── app/                 # Next.js app directory
│   │   ├── (user)/          # User portal (FE & BE)
│   │   │   ├── api/
│   │   │   │   └── activities/
│   │   │   └── pages/
│   │   │       ├── activities/
│   │   │       |   └── [id]/
|   |   |       └── components/          # Shared React components
│   │   └── admin/           # Admin portal (FE & BE)
│   │       ├── api/
│   │       │   ├── activities/
│   │       │   ├── dashboard/
│   │       │   ├── login/
│   │       │   ├── register/
│   │       │   └── users/
│   │       └── pages/
│   │           ├── activities/
│   │           │   └── [id]/
│   │           ├── components/
│   │           ├── dashboard/
│   │           ├── error/403/
│   │           ├── login/
│   │           └── users/
│   │   └── test/
│   ├── data/                # Static data
│   ├── generated/           # Generated files (e.g., Prisma client)
│   │   └── prisma/
│   └── utils/               # Utility functions
├── lib/                     # Shared libraries (e.g., prisma, supabase)
│   ├── prisma/
│   └── supabase/
├── next.config.mjs          # Next.js config
├── package.json             # Project dependencies
├── jsconfig.json            # JS/TS config
├── postcss.config.mjs       # PostCSS config
├── tailwind.config.js       # Tailwind CSS config
├── env.example              # Example environment variables
└── ...                      # Other root-level files
```

## Notes
- All user portal code (pages, components, API routes) will be moved under the `user/` directory.
- All admin portal code (pages, components, API routes) will be moved under the `admin/` directory.
- Shared code (e.g., database, authentication, utilities) remains at the root or in `lib/` and `utils/`.
- This structure will make it easier to develop, test, and deploy user and admin portals independently.

---

Let me know when you are ready to proceed with the migration or if you want a step-by-step plan for moving the files.