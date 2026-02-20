-module(marthad_paths_tests).
-include_lib("eunit/include/eunit.hrl").

base_dir_default_test() ->
    %% When no env is set, uses default ~/.hecate/hecate-marthad
    application:unset_env(hecate_marthad, data_dir),
    Home = os:getenv("HOME"),
    Expected = filename:join(Home, ".hecate/hecate-marthad"),
    ?assertEqual(Expected, marthad_paths:base_dir()).

base_dir_configured_test() ->
    application:set_env(hecate_marthad, data_dir, "/tmp/test-marthad"),
    ?assertEqual("/tmp/test-marthad", marthad_paths:base_dir()),
    application:unset_env(hecate_marthad, data_dir).

base_dir_tilde_expansion_test() ->
    application:set_env(hecate_marthad, data_dir, "~/custom/path"),
    Home = os:getenv("HOME"),
    Expected = filename:join(Home, "custom/path"),
    ?assertEqual(Expected, marthad_paths:base_dir()),
    application:unset_env(hecate_marthad, data_dir).

sqlite_path_test() ->
    application:set_env(hecate_marthad, data_dir, "/tmp/test-marthad"),
    ?assertEqual("/tmp/test-marthad/sqlite/test.db",
                 marthad_paths:sqlite_path("test.db")),
    application:unset_env(hecate_marthad, data_dir).

reckon_path_test() ->
    application:set_env(hecate_marthad, data_dir, "/tmp/test-marthad"),
    ?assertEqual("/tmp/test-marthad/reckon-db/martha",
                 marthad_paths:reckon_path("martha")),
    application:unset_env(hecate_marthad, data_dir).

socket_path_test() ->
    application:set_env(hecate_marthad, data_dir, "/tmp/test-marthad"),
    ?assertEqual("/tmp/test-marthad/sockets/api.sock",
                 marthad_paths:socket_path("api.sock")),
    application:unset_env(hecate_marthad, data_dir).

ensure_layout_test() ->
    TestDir = "/tmp/test-marthad-layout-" ++ integer_to_list(erlang:system_time(millisecond)),
    application:set_env(hecate_marthad, data_dir, TestDir),
    ok = marthad_paths:ensure_layout(),
    ?assert(filelib:is_dir(filename:join(TestDir, "sqlite"))),
    ?assert(filelib:is_dir(filename:join(TestDir, "reckon-db"))),
    ?assert(filelib:is_dir(filename:join(TestDir, "sockets"))),
    ?assert(filelib:is_dir(filename:join(TestDir, "run"))),
    ?assert(filelib:is_dir(filename:join(TestDir, "connectors"))),
    %% Cleanup
    os:cmd("rm -rf " ++ TestDir),
    application:unset_env(hecate_marthad, data_dir).
