# Hecate Martha — Unified build (frontend + daemon)
# Build context: hecate-martha/ (repo root)

# Stage 1: Build marthaw as ES module
FROM docker.io/library/node:22-alpine AS frontend

WORKDIR /frontend
COPY hecate-marthaw/package.json hecate-marthaw/package-lock.json* ./
RUN npm ci
COPY hecate-marthaw/ .
RUN npx svelte-kit sync 2>/dev/null || true
RUN npm run build:lib

# Stage 2: Build marthad Erlang release
FROM docker.io/library/erlang:27-alpine AS backend

WORKDIR /build

RUN apk add --no-cache \
    git curl bash \
    build-base cmake

RUN curl -fsSL https://s3.amazonaws.com/rebar3/rebar3 -o /usr/local/bin/rebar3 && \
    chmod +x /usr/local/bin/rebar3

# Copy rebar config and dependency lock first (layer caching)
COPY hecate-marthad/rebar.config hecate-marthad/rebar.lock* ./
COPY hecate-marthad/config/ config/

# Copy source files
COPY hecate-marthad/src/ src/
COPY hecate-marthad/apps/ apps/

# Fetch dependencies and compile
RUN rebar3 get-deps && rebar3 compile

# Bundle frontend assets into priv/static/
COPY --from=frontend /frontend/dist priv/static/

# Build release (priv/static/ included automatically)
RUN rebar3 as prod release

# Stage 3: Runtime
FROM docker.io/library/alpine:3.22

RUN apk add --no-cache \
    ncurses-libs \
    libstdc++ \
    libgcc \
    openssl \
    ca-certificates

WORKDIR /app

COPY --from=backend /build/_build/prod/rel/hecate_marthad ./

ENTRYPOINT ["/app/bin/hecate_marthad"]
CMD ["foreground"]
