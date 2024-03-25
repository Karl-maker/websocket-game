import express, { Request, Response, NextFunction }from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { Game } from './context/Game';
import { Opponent } from './services/Opponent';
import { ClientStatus, ErrorResponse } from './types';
import cors from 'cors'
import { statusToClient } from './utils/statusToClient';
import 'dotenv/config'

interface Listeners {
    "join-by-code": (params: { nickName: string; code: string; }) => void;
    "exit": () => void;
    "start": () => void;
    "play": (pickedEggs: number[]) => void;
    "result": (params: { won: boolean; }) => void;
    'reset': () => void;
}

interface Emits {
    "game-started": (data: { room: { sessionId: string }}) => void;
    'game-joined': (message: string, opponent?: { nick_name: string; }) => void;
    'game-status': (status: ClientStatus) => void;
    'game-move': (picked_eggs: number[]) => void;
    'game-result': (result: boolean) => void;
    'game-reset': () => void;
    'opponent-name': (name: string) => void;
    'player-turn': (id: string) => void;
    'error': (error: ErrorResponse) => void;
}

const app = express();
const server = createServer(app);
const io = new Server<Listeners, Emits>(server, {
    cors: {
        origin: "*",
    }
});
const port: number = Number(process.env.PORT) || 8000;
const matches: Record<string, Game> = {};

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
 * 6. opponent 'disconnect' = End --> STOP
 * 7. opponent 'disconnect' = Play --> Issue
 */

app.use(cors());
app.get('/match', (req: Request, res: Response, next: NextFunction) => {
    const listOfMatches = Object.values(matches).map((match => {
        return {
            clients: match.players.length,
            metadata: {
                gameId: match.code
            }
        }
    }));

    res.json(listOfMatches || []);
});

io.on("connection", (socket) => {
    let user: Opponent | null = null;
    let game_id: string | null = null;

    socket.on("disconnect", () => {
        if(!user || !game_id) return;

        delete matches[game_id];

        socket.broadcast.to(game_id).emit('error', {
            status: 500,
            type: 'Unexpected Issue',
            message: `${user.name} has been disconnected, please leave the game.`
        })

        socket.broadcast.to(game_id).emit('game-status', 'game_exit')

        game_id = null;
        user = null;
    });

    socket.on("exit", () => {
        if(!user || !game_id) return;

        delete matches[game_id];

        socket.broadcast.to(game_id).emit('error', {
            status: 500,
            type: 'Unexpected Issue',
            message: `${user.name} has left, please leave the game.`
        })

        socket.broadcast.to(game_id).emit('game-status', 'game_exit')
        socket.emit('game-status', 'game_exit')
        socket.leave(game_id);

        game_id = null;
        user = null;
    });

    socket.on('start', () => {
        if(!game_id) return;

        matches[game_id].players.forEach((player, i) => {
            if(!game_id) return;
            if(player.opponent.id === user?.id) matches[game_id].players[i].isReady = true;

            console.log(`${user?.id} AND ${player.opponent.id}`)
        });

        if(matches[game_id].move.length === 1) {
            socket.emit('game-move', matches[game_id].move[0].pickedEggs);
            socket.emit('player-turn', matches[game_id].move[0].userId);
        }
    })

    socket.on("join-by-code", async (arr) => {

        try {
            let foundOne = false;
            // find a game to join

            for (const key in matches) {
                const game: Game = matches[key];
                if(game.code === arr.code) {
                    user = new Opponent(arr.nickName);
                    const result = await matches[game.id].join({
                        newPlayer: user
                    });

                    if(result.error) throw result.error;
                    if(!result.game?.id) throw new Error('Issue Getting In Game');

                    game_id = result.game?.id;
                    io.to(game.id).emit('opponent-name', user.name);
                    socket.join(game.id);
                    socket.emit('game-started', { room: { sessionId: user.id } });
                    socket.emit('opponent-name', result.opponent?.name || game.players[0].opponent.name);
                    io.to(game.id).emit('game-status', statusToClient(game.state.current))
                    io.to(game.id).emit('player-turn', user.id);

                    foundOne = true;
                    break;
                }
            }

            if(!foundOne) {
                const game = new Game(arr.code);
                user = new Opponent(arr.nickName);
                game_id = game?.id;

                matches[game.id] = game;

                const result = await matches[game_id].join({
                    newPlayer: user
                });

                if(result.error) throw result.error;
                if(!result.game?.id) throw new Error('Issue Getting In Game');

                socket.emit('game-started', { room: { sessionId: user.id } });
                socket.emit('game-joined', 'You have joined the game!', { nick_name: result.opponent?.name || game.players[0].opponent.name });
                socket.join(game.id);
                io.to(game.id).emit('game-status', statusToClient(matches[game_id].state.current))
            }

        } catch(err: any) { 
            socket.emit('error', {
                status: err?.status || 500,
                message: err?.message || 'Issue Occured',
                type: err?.type || 'Unexpected Issue'
            });
        }
    })

    socket.on("play", async (arr) => {
        try {
            // find a game to join
            if(!game_id || !user?.id) throw {
                status: 404,
                type: 'Not Found',
                message: 'No Available Match Found With That Code'
            } as ErrorResponse;

            await matches[game_id].play({
                play: {
                    opponentId: user.id,
                    move: {
                        pickedEggs: arr,
                        userId: user.id
                    }
                }
            });

            if(matches[game_id].players[0].isReady && matches[game_id].players[1].isReady) {
                socket.broadcast.to(game_id).emit('game-move', arr)
                socket.broadcast.to(game_id).emit('player-turn', user.id);
            }

            socket.emit('player-turn', user.id);

        } catch(err: any) { 
            socket.emit('error', {
                status: err?.status || 500,
                message: err?.message || 'Issue Occured',
                type: err?.type || 'Unexpected Issue'
            });
        }
    })

    socket.on("reset", async () => {
        try {
            // find a game to join
            if(!game_id || !user?.id) throw {
                status: 404,
                type: 'Not Found',
                message: 'No Available Match Found With That Code'
            } as ErrorResponse;

            matches[game_id].move = [];

            matches[game_id].firstTurn = matches[game_id].firstTurn === 0 ? 1 : 0;

            io.to(game_id).emit('game-status', statusToClient('play'))
            io.to(game_id).emit('player-turn', matches[game_id].players[matches[game_id].firstTurn].opponent.id);

        } catch(err: any) { 
            socket.emit('error', {
                status: err?.status || 500,
                message: err?.message || 'Issue Occured',
                type: err?.type || 'Unexpected Issue'
            });
        }
    })
});

// Error handling middleware for Socket.IO
io.on('error', (err) => {
    // Log the error
    console.error('Socket.IO error:', err);
});

server.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
});