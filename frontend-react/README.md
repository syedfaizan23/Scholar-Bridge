# ScholarBridge — frontend

This is the React + TypeScript frontend for ScholarBridge. It was bootstrapped with Create React App, but at this point that's mostly just an implementation detail — nothing here uses CRA-specific patterns you'd need to know about beyond the standard scripts below.

For what this project actually is, how the frontend and backend fit together, and how to run the whole thing, see the [main README](../README.md) one level up. This file is just the frontend-specific notes.

## Scripts

```bash
npm start      # dev server on :3000, proxies /api to the Django backend on :8000
npm run build  # production build, output in build/
npm test       # CRA's test runner, if you add tests
```

## A couple of things specific to this frontend

- API calls go through `src/api/axios.ts`, which always hits a relative `/api` path — never a hardcoded host. In dev, the `proxy` field in `package.json` forwards those to Django on `:8000`; in production (Docker), Django serves this build itself, so it's already same-origin.
- `src/pages/Landing.tsx` is the public marketing page (default route `/`). It's styled independently in `Landing.css` rather than the shared `index.css`, so it can have its own visual language without affecting the dashboard styling.
- Logo assets live in `src/assets/` (`logo-icon.png` for tight spaces like the navbar/favicon, `logo-full.png` where there's room for the wordmark too).
