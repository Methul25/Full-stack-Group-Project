# SyncBoard

SyncBoard is a collaborative task board developed progressively across the five sessions of the Full-Stack Development workshop. Session 1 delivers a React client running entirely on mock data; later sessions add the API, database, testing, real-time collaboration, containers, and deployment.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Run locally

```bash
git clone https://github.com/Methul25/Full-stack-Group-Project.git
cd Full-stack-Group-Project
npm install
npm run dev
```

Open the local URL printed by Vite.

## Validate a contribution

```bash
npm run lint
npm run format:check
npm run build
```

## Project structure

```text
src/
  api/         Mock API now; real HTTP access from Session 2
  components/  Reusable presentational components
  context/     Shared React context providers
  data/        Session 1 mock data
  hooks/       Reusable stateful logic
  pages/       Route-level components
  styles/      Shared styling
  utils/       Pure framework-independent helpers
```

See [CONTRIBUTING.md](CONTRIBUTING.md) before starting a branch or opening a pull request.
