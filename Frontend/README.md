# Cafe Management System - Frontend

A React-based frontend for the Cafe Management System.

## Features

- User Authentication (Login/Signup)
- Dashboard with statistics
- Category Management
- Product Management
- Bill Generation and Management
- User Management
- Responsive Material-UI Design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`.

### Backend Integration

Make sure your Spring Boot backend is running on `http://localhost:8080` for the API calls to work properly.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App

## Project Structure

```
src/
├── components/          # Reusable components
├── pages/              # Page components
├── services/           # API service layer
├── utils/              # Utility functions
├── App.js              # Main app component
└── index.js            # Entry point
```