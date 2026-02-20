#!/usr/bin/env bash
set -euo pipefail

# Add mesh publish bridge to hecate-daemon
#
# Creates a pg group member in hecate_mesh that forwards
# {mesh_publish, Topic, Payload} messages from Martha daemon
# to hecate_mesh_client:publish/2.
#
# This enables Martha's marthad_mesh_proxy to publish to the
# Macula mesh via hecate-daemon's mesh connection.

DAEMON_DIR="${1:-/home/rl/work/github.com/hecate-social/hecate-daemon}"
MESH_DIR="$DAEMON_DIR/apps/hecate_mesh/src"
TARGET="$MESH_DIR/martha_mesh_bridge/martha_mesh_bridge.erl"
TARGET_SUP="$MESH_DIR/martha_mesh_bridge/martha_mesh_bridge_sup.erl"

if [[ ! -d "$MESH_DIR" ]]; then
    echo "Error: $MESH_DIR does not exist"
    exit 1
fi

echo "=== Adding Martha mesh bridge to hecate-daemon ==="

mkdir -p "$(dirname "$TARGET")"

cat > "$TARGET" << 'ERLEOF'
%%% @doc Mesh publish bridge for Martha daemon.
%%%
%%% Joins the pg group 'martha_mesh_bridge' in the 'hecate_marthad' scope.
%%% Forwards {mesh_publish, Topic, Payload} messages from Martha's
%%% marthad_mesh_proxy to hecate_mesh_client:publish/2.
%%%
%%% This bridge enables Martha (running as a separate BEAM node)
%%% to publish integration facts to the Macula mesh via hecate-daemon's
%%% mesh connection.
%%% @end
-module(martha_mesh_bridge).
-behaviour(gen_server).

-export([start_link/0]).
-export([init/1, handle_info/2, handle_call/3, handle_cast/2, terminate/2]).

-define(PG_SCOPE, hecate_marthad).
-define(PG_GROUP, martha_mesh_bridge).

start_link() ->
    gen_server:start_link({local, ?MODULE}, ?MODULE, [], []).

init([]) ->
    %% Ensure the pg scope exists
    case pg:start(?PG_SCOPE) of
        {ok, _} -> ok;
        {error, {already_started, _}} -> ok
    end,
    %% Join the bridge group so marthad_mesh_proxy can find us
    ok = pg:join(?PG_SCOPE, ?PG_GROUP, self()),
    logger:info("[martha_mesh_bridge] Joined pg group ~p:~p", [?PG_SCOPE, ?PG_GROUP]),
    {ok, #{}}.

handle_info({mesh_publish, Topic, Payload}, State) ->
    logger:debug("[martha_mesh_bridge] Publishing to mesh: ~s", [Topic]),
    case hecate_mesh_client:publish(Topic, Payload) of
        ok -> ok;
        {error, Reason} ->
            logger:warning("[martha_mesh_bridge] Mesh publish failed: ~p", [Reason])
    end,
    {noreply, State};
handle_info(_Msg, State) ->
    {noreply, State}.

handle_call(_Request, _From, State) ->
    {reply, ok, State}.

handle_cast(_Msg, State) ->
    {noreply, State}.

terminate(_Reason, _State) ->
    pg:leave(?PG_SCOPE, ?PG_GROUP, self()),
    ok.
ERLEOF

cat > "$TARGET_SUP" << 'ERLEOF'
-module(martha_mesh_bridge_sup).
-behaviour(supervisor).

-export([start_link/0]).
-export([init/1]).

start_link() ->
    supervisor:start_link({local, ?MODULE}, ?MODULE, []).

init([]) ->
    Children = [
        #{
            id => martha_mesh_bridge,
            start => {martha_mesh_bridge, start_link, []},
            restart => permanent,
            type => worker
        }
    ],
    {ok, {#{strategy => one_for_one, intensity => 5, period => 10}, Children}}.
ERLEOF

echo "Created: $TARGET"
echo "Created: $TARGET_SUP"
echo ""
echo "Next steps:"
echo "  1. Add martha_mesh_bridge_sup as a child of hecate_mesh_sup"
echo "  2. Run: cd $DAEMON_DIR && rebar3 compile"
echo "  3. Test: Start both hecate-daemon and hecate-marthad on same host"
echo "  4. Verify marthad_mesh_proxy:publish/2 reaches the mesh"
