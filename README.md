# Hecate Martha

Martha is the ALC (Application Lifecycle) / DevOps agent plugin for Hecate. She guides ventures from vision through discovery, design, planning, generation, testing, deployment, monitoring, and rescue.

## Architecture

Martha is a standalone plugin with two components:

- **hecate-marthad** — Erlang/OTP daemon managing venture and division lifecycle via event sourcing (ReckonDB + Evoq). Exposes a REST API over a Unix domain socket.
- **hecate-marthaw** — SvelteKit frontend built as an ES module. Loaded by hecate-web at runtime via plugin discovery.

The daemon communicates with hecate-daemon over OTP process groups (`pg`) for mesh bridging and LLM proxy access.

## Prerequisites

- Erlang/OTP 27+
- rebar3
- Node.js 22+
- npm

## Quick Start

### Build and Run (Development)

```bash
# Daemon
cd hecate-marthad
rebar3 get-deps && rebar3 compile
rebar3 release
_build/default/rel/hecate_marthad/bin/hecate_marthad foreground

# Frontend (separate terminal)
cd hecate-marthaw
npm ci
npm run dev
```

### Build OCI Image

```bash
docker build -t hecate-marthad:0.1.0 .
```

## Development

### Daemon

```bash
cd hecate-marthad
rebar3 compile          # Compile
rebar3 eunit            # Run tests
rebar3 dialyzer         # Type checking
rebar3 ex_doc           # Generate docs
```

### Frontend

```bash
cd hecate-marthaw
npm run dev             # Dev server (port 5175)
npm run check           # Type check (svelte-check + tsc)
npm run build:lib       # Build ES module (dist/component.js)
```

### Version Bumping

```bash
./scripts/bump-version.sh 0.2.0
```

This updates the version in `hecate_marthad.app.src`, `rebar.config`, and `package.json`.

## Plugin Integration

Martha registers with hecate-daemon on startup via the plugin registrar. When running, it exposes:

- `GET /health` — Health check
- `GET /manifest` — Plugin metadata (name, icon, description)
- `GET/POST /api/[...]` — Domain API routes (auto-discovered from apps)

The socket lives at `~/.hecate/hecate-marthad/sockets/api.sock`. Hecate-web discovers it and loads the frontend ES module.

## Domain Apps

| App | Department | Purpose |
|-----|-----------|---------|
| `guide_venture_lifecycle` | CMD | Venture inception + discovery process |
| `query_venture_lifecycle` | QRY | Venture + division read models |
| `guide_division_alc` | CMD | Division ALC phases (design through rescue) |
| `query_division_alc` | QRY | Division phase read models |

## Frontend Slices

The frontend is organized by vertical slice, one per ALC task:

| Slice | Component | Purpose |
|-------|-----------|---------|
| `compose_vision` | VisionOracle | Vision drafting with AI |
| `brainstorm_venture_events` | BrainstormVentureEvents | Event brainstorming stickies |
| `storm_venture_big_picture` | StormVentureBigPicture | Big Picture Event Storming |
| `design_division` | DesignDivision | DnA: aggregate + event design |
| `plan_division` | PlanDivision | AnP: desk planning |
| `craft_division` | CraftDivision | TnI: code generation |
| `deploy_division` | DeployDivision | DnO: releases + incidents |
| `guide_venture` | VentureHeader, VentureSummary, DivisionNav | Venture orchestration |

## License

Apache-2.0
