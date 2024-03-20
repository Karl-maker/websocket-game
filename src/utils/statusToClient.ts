import { States } from "../states/State";
import { ClientStatus } from "../types";

export function statusToClient(status: States): ClientStatus {
    if(status === 'end') return 'game_exit'
    if(status === 'play') return 'game_start'
    return 'game_ready'
}