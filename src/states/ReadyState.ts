import { Game } from "../context/Game";
import { PlayState } from "./PlayState";
import { ExitParams, ExitReponse, JoinParams, JoinReponse, PlayParams, PlayResponse, ResultParams, ResultResponse, StartParams, StartReponse, State, States } from "./State";
import { WaitState } from "./WaitState";

export class ReadyState implements State {
    current: States;

    constructor() {
        this.current = 'ready';
    }

    async join(params: JoinParams, game: Game): Promise<JoinReponse> {
        console.log("ReadyState().join()", params);
        return {
            error: {
                status: 403,
                type: 'Forbidden',
                message: 'This match is already ready'
            }
        }
    }
    async exit(params: ExitParams, game: Game): Promise<ExitReponse> {
        console.log("ReadyState().exit()", params);
        game.setState(new WaitState())
    }
    async start(params: StartParams, game: Game): Promise<StartReponse> {
        console.log("ReadyState().start()", params);
        let result: States = 'ready';
        game.players.forEach((player) => {
            if(player.opponent.id !== params.startedBy.opponentId) player.isReady = true;
        });

        if(game.players[0].isReady && game.players[1].isReady) game.setState(new PlayState());
    }
    async play(params: PlayParams, game: Game): Promise<PlayResponse> {
        console.log("ReadyState().play()", params);
    }
    async result(params: ResultParams, game: Game): Promise<ResultResponse> {
        console.log("ReadyState().result()", params);
    }
}