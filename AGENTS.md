# LLM Assistant Guide

## Purpose

Before generating or modifying code, identify the relevant topic in the table and open the linked doc. Use only conventions defined there.

## Topics and Docs

| Topic                  | Documentation Path                      | keywords                           |
| ---------------------- | --------------------------------------- | ---------------------------------- |
| IPC Main ↔ Renderer   | docs/ipc-inter-process-communication.md | Message channels, contracts, sync  |
| UI (React + Renderer)  | docs/ui.md                              | Components, layouts, accessibility |
| UI Styles              | docs/ui-styles.md                       | Tailwind, shadcn, design system    |
| Business Logic         | docs/business-logic.md                  | Services, use cases, validations   |
| Architecture           | docs/architecture.md                    | Modules, layers, patterns          |
| Project Configuration  | docs/project-setup.md                   | Scripts, packaging, Electron setup |
| Continuous Integration | docs/ci.md                              | Workflows, pipelines, checks       |
| Tests                  | docs/tests.md                           | Strategy, coverage, tools          |
| Env Variables          | docs/env-vars.md                        | Names, scopes, secrets             |

## Good practices

- Consult relevant docs before proposing or applying changes.
- Follow guides defined in docs
- Cite relative paths and key snippets when applicable.

## Conflict resolution

- If instructions clash, ask and suggest modifying the docs.
- When documentation is lacking, indicate the gap and propose how to obtain it.
- Record doubts concisely in [`docs/open-questions-llm.md`](docs/open-questions-llm.md).
- Always seek confirmation before implementing sensitive changes.
