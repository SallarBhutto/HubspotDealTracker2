
# HubSpot Deal Kanban Board

A full-stack application that provides a Kanban board interface for managing HubSpot deals. Built with React, Express, and TypeScript.

## Features

- Interactive Kanban board for deal management
- Drag-and-drop interface for moving deals between stages
- Secure authentication system
- Real-time deal updates
- Pipeline visualization
- Responsive Material UI design

## Tech Stack

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety and better developer experience
- **Material UI** - Component library for consistent design
- **React DnD** - Drag and drop functionality
- **React Query** - Server state management
- **Wouter** - Lightweight routing
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - UI component library

### Backend
- **Express** - Node.js web application framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database ORM
- **Neon Database** - Serverless Postgres database
- **Express Session** - Session management
- **Passport** - Authentication middleware
- **Zod** - Schema validation

## Project Structure

```
├── client/          # Frontend React application
├── server/          # Backend Express server
├── shared/          # Shared TypeScript types
└── types/           # Type definitions
```

## Getting Started

1. The project is set up to run both frontend and backend concurrently.
2. Run the development server:
   ```bash
   npm run dev
   ```
   This will start:
   - Frontend dev server with Vite
   - Backend Express server on port 5000

## API Endpoints

- `POST /api/login` - User authentication
- `GET /api/user` - Get current user
- `GET /api/pipelines` - Fetch pipelines
- `GET /api/deals` - Fetch all deals
- `PATCH /api/deals/:id/stage` - Update deal stage

## Authentication

The application uses session-based authentication with Passport.js. Default credentials:
- Username: admin
- Password: admin

## Development

The project uses:
- **Vite** for fast development and building
- **TypeScript** for type safety
- **ESBuild** for production builds
- **Drizzle Kit** for database migrations

## Environment Variables

The following environment variables are required:
- `FRONTEND_URL` - Frontend application URL
- `NODE_ENV` - Environment (development/production)

## Building for Production

```bash
npm run build
```

This will:
1. Build the frontend with Vite
2. Bundle the backend with ESBuild
