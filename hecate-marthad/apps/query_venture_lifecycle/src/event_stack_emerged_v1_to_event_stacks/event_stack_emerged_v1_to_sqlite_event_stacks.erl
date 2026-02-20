%%% @doc Projection: event_stack_emerged_v1 -> event_stacks table
-module(event_stack_emerged_v1_to_sqlite_event_stacks).
-export([project/1]).

project(Event) ->
    StackId = get(stack_id, Event),
    VentureId = get(venture_id, Event),
    Color = get(color, Event),
    StickyIds = get(sticky_ids, Event, []),
    EmergedAt = get(emerged_at, Event, erlang:system_time(millisecond)),
    logger:info("[PROJECTION] ~s: projecting stack ~s", [?MODULE, StackId]),
    Sql = "INSERT OR IGNORE INTO event_stacks "
          "(stack_id, venture_id, color, sticky_ids, status, emerged_at) "
          "VALUES (?1, ?2, ?3, ?4, 'active', ?5)",
    StickyIdsJson = encode_list(StickyIds),
    query_venture_lifecycle_store:execute(Sql, [
        StackId, VentureId, Color, StickyIdsJson, EmergedAt
    ]).

get(Key, Map) when is_atom(Key) ->
    case maps:find(Key, Map) of
        {ok, V} -> V;
        error -> maps:get(atom_to_binary(Key), Map, undefined)
    end.

get(Key, Map, Default) when is_atom(Key) ->
    case maps:find(Key, Map) of
        {ok, V} -> V;
        error -> maps:get(atom_to_binary(Key), Map, Default)
    end.

encode_list(List) when is_list(List) ->
    json:encode(List);
encode_list(_) ->
    <<"[]">>.
