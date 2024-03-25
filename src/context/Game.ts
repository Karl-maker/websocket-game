import { v4 } from "uuid";
import { Move } from "../services/Move";
import { Opponent } from "../services/Opponent";
import { ExitParams, JoinParams, PlayParams, ResultParams, StartParams, State } from "../states/State";
import { WaitState } from "../states/WaitState";
import { generateRandomCode } from "../utils/code";

export class Game {
    public state: State;
    public code: string;
    public id: string;
    public players: {
        opponent: Opponent;
        isReady: boolean;
    }[] = [];
    public firstTurn: number = 0;
    public move: Move[] = [];

    constructor(code?: string) {
        this.state = new WaitState();
        this.code = code || generateRandomCode(6);
        this.id = v4();
    }

    async join(params: JoinParams) {
        return this.state.join(params, this);
    }

    async exit(params: ExitParams) {
        return this.state.exit(params, this);
    }

    async play(params: PlayParams) {
        return this.state.play(params, this);
    }

    async result(params: ResultParams) {
        return this.state.result(params, this);
    }

    async start(params: StartParams) {
        return this.state.start(params, this);
    }

    // Method to set the state
    setState(state: State): void {
        this.state = state;
    }
}