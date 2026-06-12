# Star Wars Fleet Manager

An implementation of a Star Wars themed React app that connects to http://swapi.py4e.com/api and displays retrieved data.

The idea of this app is that it is a fictional fleet management dashboard for users of varying factions (i.e. the Rebel Alliance or Galactic Empire) to view and manage the state of their managed fleets & starships.

The system uses a role-based access system in combination with its authentication system to securely provide access to users who have appropriate privileges, and block access to users who do not.

## Getting Started

The app requires a valid secret string; `AUTH_SECRET`, to be defined in `.env.local` before building & running.

When running in a production environment

You may then log into any of the existing user accounts, and open the dashboard to view and manage your fleet(s). Clicking on the model or location of a starship opens a dialog that displays a more detailed view of the clicked subject.

## Architecture

### Backend

Due to time constraints, I decided to focus mainly on frontend implementation over backend, using Next.js's API routes with hard-coded values over using other microservices such as databases or a CMS. User accounts, fleets, and starships are all defined in TypeScript files, but are still fetched from the server via API routes to demonstrate backend communication.

### Authentication

This project utilizes **Auth.js**, backed by in-repo mock accounts for username/password sign-in. See `MOCK_ACCOUNTS` in `mock-accounts.ts` for a list of available accounts, as well as an overview of their assigned roles and permissions.

Sessions use JWT tokens with server-side auth checks, and an RBAC model to simulate secure & authorized access to user-specific & personalized data.

### Frontend

Chakra UI was used as a frontend library for this project to quickly implement a visually appealing UI while saving time and resources.

### Testing Environment

The project uses **Vitest** for its testing environment. To run tests, run `npm run test`.

## Limitations

Due to time constraints, the following features were purposefully left out, but would be nice to have:

- **Localization**: For improved accessibility, including localization support for various languages (German and English for a start) would allow for users to use the app in their preferred language.
- **Live Data**: Showing live-updating data, such as simulating the starships' movement and statuses would provide a good opportunity to demonstrate live-updating data.
- **Fetch Optimizations**: Although caching is already in place for SWAPI endpoints, such that data is cached for at least 24 hours before being invalidated, the /starships endpoint still performs two API requests for each record to fetch metadata relating to the starship model & location. This could be optimized via batch requesting/prefetching data, and/or only returning basic data in the /starships endpoint and then providing more detailed data for location and starship model when explicitly requested (e.g. opening a card).
