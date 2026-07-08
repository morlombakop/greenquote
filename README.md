# ⚒️ Techologies Used
- Next.js as the main development framework.
- Postgres as a production database.
- SQLite as a dev and test database
- React as a SPA library.
- Playwright for e2e tests
- Vitest for unit tests
- Docker & docker-compose : For Virtualization.


# 🚀 Up and run in 5 mins 🕙
Ensure you have Node.js v22+ installed,  docker and docker-compose installed 

First, run the development server:

- For Development / Fresh Local DB: run `npx prisma migrate dev`
- For Production / Existing DB: run `npx prisma migrate deploy` and `npx prisma generate`
- Run the Next.js Build: run `npm run build`
- Start the App: `npm run start`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


# Area of improvement

- Improve logging on the client side
- Used next-swagger-doc for API documentation
- Download PDF as Quote

