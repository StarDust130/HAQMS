# HAQMS

Simple, secure hospital booking & queue app with a clean UI.

- Fast booking and queue tokens for receptionists
- Simple doctor dashboard and patient history view
- Secure auth and role-based access

Built with Next.js (frontend), Node.js + Express (backend), Prisma + PostgreSQL.

Quick start:

1. Install: `chmod +x setup.sh && ./setup.sh`
2. Start DB: `docker-compose up -d` (or use your Postgres)
3. Seed & run: `npm run db:setup --prefix backend && npm run dev`

Seeded test accounts are created by the seed script.

Contribute via issues or PRs. Thank you!
