#!/usr/bin/env escript
main(_) ->
    Libs = ["reckon_db", "reckon_evoq", "reckon_gater", "evoq"],
    lists:foreach(fun(Lib) ->
        Dir = "_build/default/lib/" ++ Lib ++ "/ebin",
        case filelib:wildcard(Dir ++ "/*.beam") of
            [] ->
                io:format("~s: NO BEAMS FOUND~n", [Lib]);
            [Beam | _] ->
                {ok, {_, [{debug_info, DI}]}} = beam_lib:chunks(Beam, [debug_info]),
                case DI of
                    {debug_info_v1, Backend, {Data, Opts}} ->
                        io:format("~s: backend=~p data=~p opts=~p~n", [Lib, Backend, Data, Opts]);
                    Other ->
                        io:format("~s: ~p~n", [Lib, Other])
                end
        end
    end, Libs).
