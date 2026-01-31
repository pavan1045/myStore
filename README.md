# myStore - Inventory Management Application

A lightweight, offline-first inventory management web application built with React, Dexie.js (IndexedDB), and Tailwind CSS.

## Features

- **Dashboard**: Manage product categories.
- **Inventory**: Lists items with search, filter, and management (add/edit/delete).
- **Data Persistence**: Uses IndexedDB (via Dexie.js) to store data locally in the browser.
- **Backup & Restore**: Export your database to JSON and restore it anytime.
- **Responsive Design**: Clean UI based on Tailwind CSS.

## Tech Stack

- [React](https://react.dev/) (Vite)
- [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Lucide React](https://lucide.dev/) (Icons)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository (or download source).
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the local development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/   # Reusable UI components (Button, Input, Modal, etc.)
├── db/           # Dexie database schema configuration
├── hooks/        # Custom hooks (useCategories, useItems)
├── layout/       # Main app layout (Sidebar, basic structure)
├── pages/        # Application pages (Dashboard, Inventory, Settings)
├── services/     # Database service layer and utilities
└── utils/        # Helper functions
```

## Important Notes

- **Data Safety**: All data is stored in the **browser**. Clearing your browser cache/storage for the site _will delete your data_.
- **Backups**: Use the **Settings > Backup Data** feature frequently to download a JSON copy of your inventory.

## License

MIT
