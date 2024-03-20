import { Game } from "../context/Game";
import { ExitParams, ExitReponse, JoinParams, JoinReponse, PlayParams, PlayResponse, ResultParams, ResultResponse, StartParams, StartReponse, State, States } from "./State";

export class EndState implements State {
    current: States;

    constructor() {
        this.current = 'end';
    }

    async join(params: JoinParams, game: Game): Promise<JoinReponse> {
        console.log("EndState().join()", params);
        return {
            error: {
                status: 403,
                type: 'Forbidden',
                message: 'This match is already in finished'
            }
        }
    }
    async exit(params: ExitParams, game: Game): Promise<ExitReponse> {
        console.log("EndState().exit()", params);
    }
    async start(params: StartParams, game: Game): Promise<StartReponse> {
        console.log("EndState().start()", params);
    }
    async play(params: PlayParams, game: Game): Promise<PlayResponse> {
        console.log("EndState().play()", params);
    }
    async result(params: ResultParams, game: Game): Promise<ResultResponse> {
        console.log("EndState().result()", params);
    }
}