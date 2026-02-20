-module(marthad_mesh_proxy_tests).
-include_lib("eunit/include/eunit.hrl").

no_members_returns_not_connected_test() ->
    %% pg scope not started, so get_members will fail/return empty
    Result = marthad_mesh_proxy:publish(<<"test.topic">>, #{msg => <<"hello">>}),
    ?assertEqual({error, not_connected}, Result).

with_pg_member_test() ->
    %% Start pg scope
    {ok, _} = pg:start_link(hecate_marthad),
    %% Register self as bridge member
    ok = pg:join(hecate_marthad, martha_mesh_bridge, self()),
    %% Publish
    ok = marthad_mesh_proxy:publish(<<"test.topic">>, #{msg => <<"hello">>}),
    %% Verify message received
    receive
        {mesh_publish, <<"test.topic">>, #{msg := <<"hello">>}} -> ok
    after 1000 ->
        ?assert(false, "Expected mesh_publish message not received")
    end,
    %% Cleanup
    pg:leave(hecate_marthad, martha_mesh_bridge, self()).
