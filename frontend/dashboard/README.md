# Restaurant & Admin dashboard

See the [root README](../../README.md) for setup, feature flags and deployment.

- `src/api/`: all backend calls (`client.js` handles the `{ success, message, errorCode, data }` envelope)
- `src/restaurant/`: kitchen board
- `src/admin/`: overview, reports, users, drivers, audit log
- `src/lib/status.js`: order statuses and restaurant transitions (mirrors the backend enum)
