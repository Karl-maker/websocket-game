export type ErrorResponse = {
    status: number;
    type: 'Forbidden' | 'Not Found' | 'Unauthorized' | 'Unexpected Issue';
    message: string; 
}

export type ClientStatus = 'game_ready' | 'game_exit' | 'game_start';