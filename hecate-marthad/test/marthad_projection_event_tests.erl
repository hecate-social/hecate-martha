-module(marthad_projection_event_tests).
-include_lib("eunit/include/eunit.hrl").
-include_lib("reckon_gater/include/esdb_gater_types.hrl").

to_map_record_test() ->
    Event = #event{
        event_id = <<"evt-1">>,
        event_type = <<"venture_initiated_v1">>,
        stream_id = <<"venture-123">>,
        version = 1,
        metadata = #{},
        timestamp = <<"2026-02-20T00:00:00Z">>,
        epoch_us = 1740009600000000,
        data = #{name => <<"My Venture">>, vision => <<"Build things">>}
    },
    Map = marthad_projection_event:to_map(Event),
    %% Envelope fields
    ?assertEqual(<<"evt-1">>, maps:get(event_id, Map)),
    ?assertEqual(<<"venture_initiated_v1">>, maps:get(event_type, Map)),
    ?assertEqual(<<"venture-123">>, maps:get(stream_id, Map)),
    ?assertEqual(1, maps:get(version, Map)),
    %% Data fields (merged at top level)
    ?assertEqual(<<"My Venture">>, maps:get(name, Map)),
    ?assertEqual(<<"Build things">>, maps:get(vision, Map)).

to_map_record_no_data_test() ->
    Event = #event{
        event_id = <<"evt-2">>,
        event_type = <<"test_event">>,
        stream_id = <<"stream-1">>,
        version = 1,
        metadata = #{},
        timestamp = <<"2026-02-20T00:00:00Z">>,
        epoch_us = 1740009600000000,
        data = undefined
    },
    Map = marthad_projection_event:to_map(Event),
    ?assertEqual(<<"evt-2">>, maps:get(event_id, Map)),
    ?assertNot(maps:is_key(name, Map)).

to_map_plain_map_test() ->
    Input = #{event_id => <<"evt-3">>, name => <<"test">>},
    ?assertEqual(Input, marthad_projection_event:to_map(Input)).

envelope_wins_on_collision_test() ->
    Event = #event{
        event_id = <<"evt-4">>,
        event_type = <<"test_event">>,
        stream_id = <<"stream-1">>,
        version = 2,
        metadata = #{},
        timestamp = <<"2026-02-20T00:00:00Z">>,
        epoch_us = 1740009600000000,
        data = #{event_id => <<"should-be-overridden">>}
    },
    Map = marthad_projection_event:to_map(Event),
    ?assertEqual(<<"evt-4">>, maps:get(event_id, Map)).
