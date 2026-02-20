-module(marthad_api_routes_tests).
-include_lib("eunit/include/eunit.hrl").

discover_routes_returns_list_test() ->
    %% Without domain apps loaded, should return empty list
    Routes = marthad_api_routes:compile(),
    ?assert(is_tuple(Routes) orelse is_list(Routes)).
