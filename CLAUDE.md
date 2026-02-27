# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This project is in early initialization — no application code or build system exists yet.

## Environment Variables

Environment variables are managed with [Varlock](https://varlock.dev). The schema is defined in `.e
nv.schema` using `@env-spec` annotations.

| Command | Purpose |
|---|---|
| `varlock load` | Validate all env vars, show masked values |
| `varlock load --quiet` | Validate silently (exit 1 on failure) |
| `varlock load \| grep VAR_NAME` | Check a specific variable (masked) |
| `varlock run -- <cmd>` | Run a command with secrets injected |
| `cat .env.schema` | View schema structure (safe — no values) |

Never use `cat .env`, `echo $VAR`, `printenv`, or the Read tool on `.env` — secrets must not appear in Claude's context.

| Variable | Required | Notes |
|---|---|---|
| `LINEAR_API_KEY` | yes | Linear API key (`lin_api_...`) |

TypeScript types for env vars are auto-generated to `env.d.ts` via the `@generateTypes` directive in `.env.schema`.

## Integrations

- **Linear** — issue tracking via the Linear MCP server and `~/.claude/skills/linear`
