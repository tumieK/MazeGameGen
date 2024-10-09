/*PURPOSE OF THE CODE: handling everything from lobby 
creation and player management to game state updates, 
player movement, and power-up activation. It keeps track of players' actions, 
enforces game rules, and ensures synchronization between all 
clients connected to the same lobby.*/
const express = require('express')
const generateMaze = require('./maze');
const app = express();
const port = 3030;
//Serve static files from the public directory
app.use(express.static('public'));
//Set the default board and size and initialize the lobbies object to store game session
const defaultBoardSize = 12;
let lobbies = {};
//Routing to create a new lobby
app.get("/lobby/create", (req, res) => {
    //Below code creates the lobby ID using random 6 letters using uppercase alphabets
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let id = "";
    for (let i = 0; i < 6; i++) {
        let idx = Math.max(Math.min(Math.floor(Math.random()*alphabet.length), alphabet.length), 0);
        id += alphabet[idx];
    }
    // Define a new lobby object with default settings and a randomly generated maze
    let lobby = {
        id,
        status: 'waiting',// Status of the lobby ('waiting' or 'playing')
        gravityAngle: 0,// Initial gravity angle
        winner: "",// Placeholder for the winner
        boardSize: defaultBoardSize,// Size of the game board (maze)
        walls: generateMaze(defaultBoardSize),// Maze generated for the lobby
        players: {}, // Stores player information
        powerUps: [],// Array to store power-ups
    };
    // Randomly open some walls in the maze
    for (let i = 0; i < lobby.boardSize / 4; i++) {
        let j = Math.max(Math.min(Math.floor(Math.random() * lobby.boardSize), lobby.boardSize), 0);
        let idx = lobby.boardSize + j*(lobby.boardSize+1);
        lobby.walls[idx].t = false;// Removes a wall
    }
    // Add random power-ups to the maze
    for (let i = 0; i < lobby.boardSize * lobby.boardSize / 32; i++) {
        let x = Math.max(Math.min(Math.floor(Math.random() * lobby.boardSize), lobby.boardSize), 0);
        let y = Math.max(Math.min(Math.floor(Math.random() * lobby.boardSize), lobby.boardSize), 0);
        // Avoid placing power-ups on the same spot
        if (lobby.powerUps.find(value => value.x == x && value.y == y)) {
            i -= 1;
            break;
        }
        // Add power-up to the lobby
        lobby.powerUps.push({
            x,
            y,
            skill: '0g',// Skill associated with power-up (e.g., zero gravity)
            holder: "",// Player who picks up the power-up
            timeActivated: -1,// Timestamp when activated
        });
    }
    // Store the lobby in the lobbies object
    lobbies[id] = lobby;
    // Respond with the newly created lobby data
    res.json(lobby);
});
// Route for players to join a lobby
app.get("/lobby/join", (req, res) => {
    let lobbyId = req.query.lobby;
    let username_ = req.query.username; // Add to the client
    let lobby = lobbies[lobbyId];
    // Check if the lobby exists and if there's space to join
    if (lobby === undefined) {
        res.json({'error': "Lobby doesn't exist."});
    } else if (Object.keys(lobby.players).length >= 4) {
        res.json({'error': 'Lobby full.'});
    } else {
        // Generate a unique player ID and add the player to the lobby
        let playerId = Math.round(Math.random()*1.0e9)+"";
        lobby.players[playerId] = {
            playerId: playerId,
            username: username_,
            score: 0,
            gravityAngle: 0,
            x: 0,// Player's x position
            y: 0,// Player's y position
            vx: 0,// Player's velocity in x
            vy: 0,// Player's velocity in y
            lastPoll: new Date().getTime() + 10000,// Timestamp of the last poll
        };
        // Respond with player and lobby details
        res.json({
            player: playerId,
            lobby: lobby,
        });
    }
});
// Route to start a lobby (begin the game)
app.get("/lobby/start", (req, res) => {
    let lobbyId = req.query.lobby;
    let lobby = lobbies[lobbyId];
    // Check if the lobby exists
    if (lobby === undefined) {
        res.json({'error': "Lobby doesn't exist."});
    } else {
        // Update lobby status to 'playing'
        lobby.status = 'playing';
        res.json({
            lobby
        });
    }
});
// Route to reset the lobby (restart the game)
app.get("/lobby/reset", (req, res) => {
    let lobbyId = req.query.lobby;
    let lobby = lobbies[lobbyId];
    // Check if the lobby exists
    if (lobby === undefined) {
        res.json({'error': "Lobby doesn't exist."});
    } else {
        // Reset lobby to initial state
        lobby.winner = "";
        lobby.status = 'waiting';
        lobby.walls = generateMaze(lobby.boardSize);// Regenerate the maze
        // Re-open walls and add power-ups
        for (let i = 0; i < lobby.boardSize / 4; i++) {
            let j = Math.max(Math.min(Math.floor(Math.random() * lobby.boardSize), lobby.boardSize), 0);
            let idx = lobby.boardSize + j*(lobby.boardSize+1);
            lobby.walls[idx].t = false;
        }
         // Reset power-ups
        lobby.powerUps = [];
        for (let i = 0; i < lobby.boardSize * lobby.boardSize / 32; i++) {
            let x = Math.max(Math.min(Math.floor(Math.random() * lobby.boardSize), lobby.boardSize), 0);
            let y = Math.max(Math.min(Math.floor(Math.random() * lobby.boardSize), lobby.boardSize), 0);
            if (lobby.powerUps.find(value => value.x == x && value.y == y)) {
                i -= 1;
                break;
            }
            lobby.powerUps.push({
                x,
                y,
                skill: '0g',
                holder: "",
                timeActivated: -1,
            });
        }
         // Respond with the reset lobby data
        res.json({
            lobby
        });
    }
});
// Route to handle power-up collection by players
app.get("/lobby/powerup", (req, res) => {
    let lobbyId = req.query.lobby;
    let lobby = lobbies[lobbyId];
    let playerId = req.query.player;
    let px = parseInt(req.query.px);
    let py = parseInt(req.query.py);
     // Check if the lobby exists
    if (lobby === undefined) {
        res.json({'error': "Lobby doesn't exist."});
    } else {
        // Find and assign the power-up to the player if it's not already collected
        const p = lobby.powerUps.find(powerUp => powerUp.x == px && powerUp.y == py);

        if (p && !p.holder) {
            p.holder = playerId;
            p.timeActivated = new Date().getTime();
        }
       // Respond with success message
        res.json({
            'message': 'success',
            // lobby,
        });
    }
});
// Route to handle lobby polling for player movements and updates
app.get("/lobby/poll", (req, res) => {
    const lobbyId = req.query.lobby;
    const playerId = /** @type {string | undefined} */(req.query.player);
    const timestamp = parseInt(req.query.timestamp);
    const gravity = playerId ? parseFloat(req.query.gravity) : 0.0;
    const bx = playerId ? parseFloat(req.query.bx) : 0.0;
    const by = playerId ? parseFloat(req.query.by) : 0.0;
    const vx = playerId ? parseFloat(req.query.vx) : 0.0;
    const vy = playerId ? parseFloat(req.query.vy) : 0.0;
    const win = req.query.win !== undefined;
    let lobby = lobbies[lobbyId];
    // Check if the lobby and player exist
    if (lobby === undefined) {
        res.json({'error': "Lobby doesn't exist."});
        return;
    }
    if (playerId && !(playerId in lobby.players)) {
        res.json({'error': "Player not in game."});
        return;
    }
    // Update player movement and state if this is the latest poll
    const time = new Date().getTime();
    if (playerId && timestamp > lobby.players[playerId].lastPoll) {
        lobby.players[playerId].gravityAngle = gravity;
        lobby.players[playerId].x = bx;
        lobby.players[playerId].y = by;
        lobby.players[playerId].vx = vx;
        lobby.players[playerId].vy = vy;
        lobby.players[playerId].lastPoll = timestamp;
        // Handle win conditions
        if (lobby.status === 'playing' && win && !lobby.winner) {
            lobby.winner = playerId;
            lobby.status = 'finished';
            lobby.players[playerId].score += 1;
        }
        // Calculate average gravity for all players and update lobby's gravity angle
        let averageGravity = 0.0;
        const keys = Object.keys(lobby.players);
        keys.forEach(p => {
            averageGravity += lobby.players[p].gravityAngle;
        });
        averageGravity /= keys.length || 1;
        lobby.gravityAngle = lobby.gravityAngle * 4 / 5.0 + averageGravity / 5.0;
    }
   //removing power-up that have been activated for more than 7 seconds.
    lobby.powerUps = lobby.powerUps.filter(powerUp => powerUp.timeActivated < 0 || powerUp.timeActivated + 7500 >= time);
   //Remove a player thats inactive
    let playerRemove = Object.values(lobby.players).filter(player => player.lastPoll >= 0 && player.lastPoll + 10000 < time);
    playerRemove.forEach(p => {
        delete lobby.players[p.playerId];
    });
    res.json({
        timestamp: new Date().getTime(),
        lobby,
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Listening on port ${port}`);
});
