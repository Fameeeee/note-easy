## Note Easy

This app now uses MongoDB via Prisma. Docker has been removed.

### Setup

1. Copy .env.example to .env and set DATABASE_URL to your MongoDB connection string.
2. Generate Prisma Client.
3. Run the app.

### Commands

Development:
- npm run dev

Build:
- npm run build

Prisma:
- npx prisma generate
- npm run db:studio
