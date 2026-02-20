# Changelog

## [0.1.0] - 2026-02-20

### Added

- Initial extraction from hecate-daemon and hecate-web as standalone plugin
- **hecate-marthad**: Erlang/OTP daemon with ReckonDB event store (`martha_store`)
  - `guide_venture_lifecycle` — Venture inception + discovery (CMD)
  - `query_venture_lifecycle` — Venture + division read models (QRY)
  - `guide_division_alc` — Division ALC phases: design, plan, generate, test, deploy, monitor, rescue (CMD)
  - `query_division_alc` — Division phase read models with 14 SQLite tables (QRY)
  - Health + manifest endpoints for plugin discovery
  - Auto-discovering API route handler
  - Mesh proxy via OTP pg process groups
  - Plugin registrar for hecate-daemon integration
- **hecate-marthaw**: SvelteKit frontend as ES module plugin
  - Vertical slice architecture by ALC task
  - 8 slice directories with stores and components
  - Decomposed god-store (devops.ts) into focused slice stores
  - Plugin API pattern (setApi/getApi) replacing Tauri invoke
  - AI assist integration with phase-aware model affinity
  - Big Picture Event Storming with full lifecycle
- **Build infrastructure**: 3-stage Dockerfile, GitHub Actions CI/CD, version bump script
