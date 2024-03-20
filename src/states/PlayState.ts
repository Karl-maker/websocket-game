import { Game } from "../context/Game";
import { EndState } from "./EndState"
import { ExitParams, ExitReponse, JoinParams, JoinReponse, PlayParams, PlayResponse, ResultParams, ResultResponse, StartParams, StartReponse, State, States } from "./State";

export class PlayState implements State {
    current: States;

    constructor() {
        this.current = 'play'
    }

    async join(params: JoinParams, game: Game): Promise<JoinReponse> {
        console.log("PlayState().join()", params);
        return {
            error: {
                status: 403,
                type: 'Forbidden',
                message: 'This match is already in play'
            }
        }
    }
    async exit(params: ExitParams, game: Game): Promise<ExitReponse> {
        console.log("PlayState().exit()", params);
        game.setState(new EndState());
    }
    async start(params: StartParams, game: Game): Promise<StartReponse> {
        console.log("PlayState().start()", params);
    }
    async play(params: PlayParams, game: Game): Promise<PlayResponse> {
        console.log("PlayState().play()", params);
        game.move.push(params.play.move)
    }
    async result(params: ResultParams, game: Game): Promise<ResultResponse> {
        console.log("PlayState().result()", params);
        game.setState(new EndState());
    }
}