Backend setup:
1. cp .env.example .env and fill credentials
2. npm install
3. create database and run: psql -U <user> -d <db> -f models/init.sql
4. npm run seed
5. npm run dev
