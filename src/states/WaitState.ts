import { Game } from "../context/Game";
import { Opponent } from "../services/Opponent";
import { EndState } from "./EndState";
import { PlayState } from "./PlayState";
import { ReadyState } from "./ReadyState";
import { ExitParams, ExitReponse, JoinParams, JoinReponse, PlayParams, PlayResponse, ResultParams, ResultResponse, StartParams, StartReponse, State, States } from "./State";

export class WaitState implements State {
    current: States;

    constructor() {
        this.current = 'wait';
    }

    async join(params: JoinParams, game: Game): Promise<JoinReponse> {
        console.log("WaitState().join()", params);
        if(game.players.length < 2) {
            let opponent: Opponent | null = null; 
            if(game.players.length === 1) {
                opponent = game.players[0].opponent;
                game.setState(new PlayState());
            }
            game.players.push({
                opponent: params.newPlayer,
                isReady: false
            });
            const result: JoinReponse = opponent ? {
                game: {
                    id: game.id,
                    code: game.id
                },
                opponent: {
                    name: opponent.name
                }
            } : {
                game: {
                    id: game.id,
                    code: game.id
                },
            };

            return result
        }
        return {
            error: {
                status: 403,
                type: 'Forbidden',
                message: 'Cannot join full match'
            }
        }
    }
    async exit(params: ExitParams, game: Game): Promise<ExitReponse> {
        console.log("WaitState().exit()", params);
        game.setState(new EndState());
    }
    async start(params: StartParams, game: Game): Promise<StartReponse> {
        console.log("WaitState().start()", params);
    }
    async play(params: PlayParams, game: Game): Promise<PlayResponse> {
        console.log("WaitState().play()", params);
    }
    async result(params: ResultParams, game: Game): Promise<ResultResponse> {
        console.log("WaitState().result()", params);
    }
}