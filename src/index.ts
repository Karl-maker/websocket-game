import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);
const port: number = 8000;

/**
 * @requirements
 * 
 * 1. Connect Players To Random Matches
 * 2. Connect Players To Matches By Code
 * 3. Allow Players To Restart Game
 * 4. Allow Players To End / Quit Prematurely
 * 5. Continue Game
 * 
 * @states
 * 
 * 1. Wait
 * 2. Ready
 * 3. Play
 * 4. End
 * 5. Issue
 * 
 * @transitions
 * 
 * 1. 2 opponents 'join' = Wait --> Ready
 * 2. opponent 'disconnect' = Ready --> Wait
 * 3. 2 opponents select 'play' = Ready --> Play
 * 4. opponent 'result' = Play --> End
 * 5. 2 opponents 'restart' End --> Play
 * 6. opponent 'disconnect' = End --> Issue
 * 7. opponent 'disconnect' = Play --> Issue
 */

server.listen(port, () => {
    console.log(`Running on port: ${port}`)
})