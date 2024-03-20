import { Game } from "../context/Game";
import { Move } from "../services/Move";
import { Opponent } from "../services/Opponent";
import { ErrorResponse } from "../types";

export interface State {
    current: States;
    join(params: JoinParams, game: Game): Promise<JoinReponse>;
    exit(params: ExitParams, game: Game): Promise<ExitReponse>;
    start(params: StartParams, game: Game): Promise<StartReponse>;
    play(params: PlayParams, game: Game): Promise<PlayResponse>;
    result(params: ResultParams, game: Game): Promise<ResultResponse>;
    //reset(params: ResetParams, game: Game): Promise<ResetResponse>;
}

export type States = 'play' | 'end' | 'ready' | 'wait';

export type ErrorResult = {
    error?: ErrorResponse
}

export type StartParams = {
    startedBy: {
        opponentId: string;
    };
}

export type StartReponse = void

export type ResetParams = {

}

export type ResetResponse = void

export type JoinParams = {
    newPlayer: Opponent;
}

export type JoinReponse = ErrorResult & {
    game?: {
        id: string;
        code: string;
    };
    opponent?: {
        name: string;
    };
}

export type ExitParams = {
    playerThatExited: Opponent;
}

export type ExitReponse = void

export type PlayParams = {
    play: {
        opponentId: string;
        move: Move;
    };
}

export type PlayResponse = void

export type ResultParams = {
    sentBy: {
        opponentId: string;
        isWon: boolean;
    };
}

export type ResultResponse = void