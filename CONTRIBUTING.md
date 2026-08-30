# Contributing to SyncBoard

All assessed work must be completed through an individual feature branch and a reviewed pull request. Never commit another member's implementation under your identity, rewrite shared history, or change commit timestamps.

## Start a contribution

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/member-N-short-description
```

Use one of these prefixes when appropriate: `feature/`, `fix/`, `docs/`, `test/`, or `chore/`.

## Before committing

```bash
npm run lint
npm run build
git status
git diff
```

Stage only files that belong to your contribution. Avoid `git add .` unless you have inspected every changed file.

```bash
git add <your-files>
git diff --cached
git commit -m "type(scope): concise description"
git push -u origin <your-branch>
```

## Pull requests

- Explain what changed and why.
- List the validation commands you ran.
- Request at least one review from another group member.
- Respond to review comments before merging.
- Keep the feature commits visible; do not squash or force-push shared history.
- Delete the remote feature branch only after the pull request is merged.

## Code conventions

- One React component per file, named to match the file.
- Reusable presentational components belong in `src/components`.
- Route-level components belong in `src/pages`.
- Components must not call `fetch` directly; network access belongs in `src/api`.
- Shared stateful logic belongs in `src/hooks` and `src/context`.
- Pure framework-independent functions belong in `src/utils`.
- Static client metadata, such as task-column definitions, belongs in `src/data`.
