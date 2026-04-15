# Trello Clone - SDE Intern Assignment

A Kanban-style project management tool inspired by Trello UX, built with React (Vite) and Node.js (Express).

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database Design: MySQL schema and seed SQL files

## Features Implemented

- Board management
  - Create board
  - Switch active board
- Lists management
  - Create list
  - Edit list title
  - Delete list
  - Drag and drop list reorder
- Cards management
  - Create cards
  - Edit card title and description
  - Delete cards
  - Drag and drop cards within/across lists
- Card details
  - Labels
  - Due date
  - Checklist with completed/incomplete items
  - Member assignment
- Search and filters
  - Search by title
  - Filter by labels
  - Filter by members
  - Filter by due date
- Seed data
  - Sample board, lists, cards, members

## Project Structure

- `src/` - Frontend React app
- `server/` - Express API for board state
- `database/schema.sql` - MySQL schema design
- `database/seed.sql` - Sample SQL seed data

## Setup Instructions

1. Install dependencies

```bash
npm install
```

2. Configure backend environment

- Copy `.env.example` to `.env` (already created in this repo) and set your MySQL credentials.

3. Start backend server

```bash
npm run server
```

4. In another terminal, start frontend

```bash
npm run dev
```

Frontend runs at `http://localhost:5173` and backend at `http://localhost:4000`.

## Database Setup (MySQL Workbench)

1. Open MySQL Workbench and connect to your local MySQL server.
2. Open and run `database/schema.sql`.
3. Open and run `database/seed.sql`.

The Express API now reads/writes actual MySQL data using `mysql2` queries.

## Assumptions

- No authentication (default workspace/user context).
- Single-page app focus with Trello-like interaction patterns.
- API endpoints are fully integrated with a MySQL database for persistent storage.
