
# Note Easy

Note Easy is a Next.js note-taking app using PostgreSQL and Prisma, ready for local development or Docker deployment.

## Quick Start


### 1. Clone and Setup
```sh
git clone <repo-url>
cd note-easy
cp .env.example .env
# (Optional) Edit .env if you want to change DB credentials/ports
```

### 2. Build and Run with Docker (Recommended & Only Supported)
This will start both the app and a PostgreSQL database:
```sh
docker compose up --build
```
The app will be available at [http://localhost:3000](http://localhost:3000)

> **Note:** Local-only (non-Docker) development is not officially supported. Always use Docker for building and running this project.


## Useful Docker Commands

- **Build and run:**
	```sh
	docker compose up --build
	```
- **Stop containers:**
	```sh
	docker compose down
	```
- **View logs:**
	```sh
	docker compose logs app
	docker compose logs db
	```


## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (see `.env.example`)
- `NEXTAUTH_URL` — Base URL for NextAuth (usually `http://localhost:3000`)
- `NEXTAUTH_SECRET` — Secret for NextAuth sessions


## Database

The default Docker Compose setup runs Postgres on port 5433. If you want to use a different port, update both `docker-compose.yml` and `.env`.


## Troubleshooting

- If you see a Prisma error about the database URL, check your `.env` and make sure it matches the Docker Compose port and credentials.
- If you change the schema, run `docker compose exec app npx prisma db push` to update the database inside the container.
- To inspect the database, use `docker compose exec app npx prisma studio`.

---
Happy note-taking!
