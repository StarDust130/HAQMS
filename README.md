<div align="center">

# 🏥 HAQMS
### **H**ospital **A**ppointment & **Q**ueue **M**anagement **S**ystem
<img src="./banner.png" alt="HAQMS Banner" width="100%" />

> _"Redefining healthcare workflows with an elegant, lightning-fast queueing and booking experience. The future of clinical administration is here."_ ⚡

[![Frontend on Vercel](https://img.shields.io/badge/Vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)](https://haqms-stardust.vercel.app/)
[![Backend on Railway](https://img.shields.io/badge/Railway-%23131415.svg?style=for-the-badge&logo=railway&logoColor=white)](https://haqms-stardust.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)](#)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](#)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](#)

⭐ **[EXPERIENCE THE LIVE DEMO](https://haqms-stardust.vercel.app/)** ⭐

</div>

<br/>

## 🚀 Welcome to the Next Generation of Queues

Break free from chaotic waiting rooms. **HAQMS** is engineered to eliminate friction from hospital visits, creating a hyper-smooth operational flow for staff and a stress-free experience for patients.

### 🎥 See It In Action

> _"Because a seamlessly fluid UI is worth a million words."_

<div align="center">
  <img src="./demo.gif" alt="HAQMS Animated Demo" style="border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.2);" width="90%" />
</div>

<br/>

## ⚡ Core Features

| 🎟️ **Instant Booking & Queues**                                                        | 👨‍⚕️ **Smart Doctor Dashboard**                                                                   | 🔐 **Bulletproof Security**                                                                              |
| :------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| Ultra-fast token generation tailored for high-volume receptionists. No lag, no delays. | A beautiful, distraction-free interface to manage patient flow and dive into medical histories. | Fully integrated, enterprise-grade Role-Based Access Control (RBAC). Data stays exactly where it should. |

<br/>

## 💎 The Tech Arsenal

We don't compromise on architecture. Built aggressively for scale and speed:

- **Frontend Magic:** Next.js (React) — Deployed on **Vercel** for optimal edge delivery.
- **Backend Power:** Node.js + Express.js — Deployed on **Railway** for robust performance.
- **Database Engine:** PostgreSQL managed via Prisma ORM for flawless querying and schema safety.

<br/>

## 🛠️ Fixes, Updates & Evolution

> _"Perfection is a moving target. We never stop iterating."_

We are constantly squashing bugs, crushing tech debt, and shipping bleeding-edge features. Curious about the latest patches?  
🔥 **[Dive into the FIXES.md Changelog](./FIXES.md)**

<br/>

## 💻 Hack on HAQMS (Local Setup)

Ready to get your hands dirty? Spin up the environment in seconds.

```bash
# 1. Clone the masterpiece
git clone https://github.com/TechFigitablLabs/HAQMS.git
cd HAQMS

# 2. Trigger the magic install
chmod +x setup.sh && ./setup.sh

# 3. Ignite the database (Requires Docker)
docker-compose up -d

# 4. Seed test logic & launch!
npm run db:setup --prefix backend
npm run dev
```

> **💡 Pro Tip:** Our intelligent `seed` script drops a full suite of test accounts into your database so you can jump directly into the UI!

---

<div align="center">
  <b>Designed & Developed with ❤️ for a Better Healthcare World.</b><br>
  <i>Pushing boundaries one commit at a time.</i>
</div>
