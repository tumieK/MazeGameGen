// This line checks for errors in the code as you write it
// @ts-check

// This class is used to represent a point with two numbers: x and y, like coordinates on a grid
class Vec2 {
    /**
	 *This is the function that gets called when you create a new point
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
		// Save the x and y coordinates as part of this point
        /** @type {number} */
        this.x = x;
        /** @type {number} */
        this.y = y;
    }

    /**
	 * This function calculates how long the vector (the line from the origin to this point) is
     * @returns {number}
     */
    length() {
		// Uses a math formula (Pythagorean theorem) to calculate length
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

    /**
	 *This function calculates something called the dot product, which compares two vectors
     * @param {Vec2} other
     * @returns {number}
     */
    dot(other) {
		// Multiply the x's and y's of the two vectors and add them together
        return this.x * other.x + this.y * other.y;
    }

    /**
	 * This function "projects" one vector onto another.E.g dropping one vector onto another to see how much they overlap.
     * @param {Vec2} other
     * @returns {Vec2}
     */
    project(other) {
		// Multiply the "other" vector by a number that represents how much they overlap
        return other.mul(this.dot(other) / other.length());
    }

    /**
	 * This function adds two vectors (or points) together to make a new one
     * @param {Vec2} other
     * @returns {Vec2}
     */
    add(other) {
        return new Vec2(this.x + other.x, this.y + other.y);
    }

    /**
	 * This function subtracts one vector from another to see the difference
     * @param {Vec2} other
     * @returns {Vec2}
     */
    sub(other) {
        return new Vec2(this.x - other.x, this.y - other.y);
    }

    /**
	 * This function multiplies the vector by a number, which could make it bigger or smaller
     * @param {number} other
     */
    mul(other) {
        return new Vec2(this.x * other, this.y * other);
    }

    /**
	 * This function divides the vector by a number, which could make it smaller
     * @param {number} other
     */
    div(other) {
        return new Vec2(this.x / other, this.y / other);
    }
}
// This class is used to represent a box shape. The box has a minimum point (bottom-left corner) and a maximum point (top-right corner)

class AABB {
    /**
	 * Creates a new box with a minimum and maximum point
     * @param {Vec2} min
     * @param {Vec2} max
     */
    constructor(min, max) {
        /** @type {Vec2} */
        this.min = min;
        /** @type {Vec2} */
        this.max = max;
    }

    // Citation: https://gamedev.stackexchange.com/questions/156870/how-do-i-implement-a-aabb-sphere-collision
    /**
	 * This function calculates the distance from a point to the box
     * @param {Vec2} p
     * @returns {number}
     */
    squareDistPoint(p) {
        let sqrDist = 0;
        // If the point is outside the box on the left, add the distance squared
        if (p.x < this.min.x) sqrDist += (this.min.x - p.x) * (this.min.x - p.x);
        // If the point is outside the box on the right, add the distance squared
		if (p.x > this.max.x) sqrDist += (p.x - this.max.x) * (p.x - this.max.x);
		// If the point is below the box, add the distance squared
		if (p.y < this.min.y) sqrDist += (this.min.y - p.y) * (this.min.y - p.y);
        // If the point is above the box, add the distance squared
		if (p.y > this.max.y) sqrDist += (p.y - this.max.y) * (p.y - this.max.y);

        return sqrDist;// Return the total distance
    }

    // Citation: https://gamedev.stackexchange.com/questions/156870/how-do-i-implement-a-aabb-sphere-collision
    /**
     * This function checks if a ball (or sphere) touches or collides with the box
     * @param {Sphere} sphere
     * @returns {boolean}
     */
    collideSphere(sphere) {
        const sqrDist = this.squareDistPoint(sphere.centre);
        return sqrDist <= sphere.radius*sphere.radius;
    }

    // Citation: https://gamedev.stackexchange.com/questions/156870/how-do-i-implement-a-aabb-sphere-collision
    /**
     * Finds the closest point on the box to another point
     * @param {Vec2} p
     * @returns {Vec2}
     */
    closestPoint(p) {
        let qx = 0;
        let qy = 0;
        // Find the closest x-coordinate
        let v = p.x;
        if (v < this.min.x) v = this.min.x;// If the point is to the left of the box, use the left edge
        if (v > this.max.x) v = this.max.x;// If the point is to the right of the box, use the right edge
        qx = v;
        // Find the closest y-coordinate
        v = p.y;
        if (v < this.min.y) v = this.min.y;// If the point is below the box, use the bottom edge
        if (v > this.max.y) v = this.max.y;// If the point is above the box, use the top edge
        qy = v;
        
        return new Vec2(qx, qy);
    }
}
// This class is used to represent a ball (or sphere)
class Sphere {
    /**
	 *Creates a new ball with a center point and a radius
     * @param {Vec2} centre
     * @param {number} radius
     */
    constructor(centre, radius) {
        /** @type {Vec2} */
        this.centre = centre;// Save the center of the ball
        /** @type {number} */
        this.radius = radius;// Save the size of the ball (the radius)
    }
}
// This part of the code grabs information from the URL in the browser.
// It looks for a "lobby" and "player" value in the web address to see what game room the player is in.
const urlParams = new URLSearchParams(window.location.search);
const lobbyId = urlParams.get('lobby') ?? "";// If there's no "lobby" in the URL, use an empty string
const player = urlParams.get('player');// Get the player's ID or name from the URL

// Define the height of the walls in the game world (used to keep balls inside)
const wallHeight = 1.0;

// These are the colors of the balls in the game, represented by RGB values
const ballColours = [
    [0, 0, 0],//Black
    [255, 255, 0],//Yellow
    [0, 255, 0],//Green
    [0, 0, 255],//Blue
];
// These are the names of the colors, so we can refer to them in text
const ballColourNames = [
"BLACK","YELLOW","GREEN","BLUE"
];
// HTML Elements that wrap the clock for a 0g (zero-gravity) power-up feature
const clock0gWrapper = document.getElementById("0g-clock-wrapper");
const clock0g = document.getElementById("0g-clock");

/**@type {HTMLCanvasElement | null | undefined}*/
// Declare a variable for the WebGL canvas, which will be used for rendering
let canvas;
/**@type {WebGLRenderingContext | null | undefined}*/
// Declare a variable to hold the WebGL context, which allows drawing in 3D
let gl;
/**@type {WebGLProgram | null | undefined} */
// Declare a variable for the WebGL program, which contains vertex and fragment shaders
let program;
/**@type {WebGLBuffer | null | undefined} */
// Declare a buffer to store vertex data (i.e., the points in space used to render shapes)
let vertexBuffer;
/**@type {Float32Array | undefined} */
// Declare an array for perspective matrix used in 3D transformations
let perspective;

// The identity matrix is used as the default transformation matrix (no changes)
const IDENTITY = new Float32Array([
    1,0,0,0,// First column of the matrix
    0,1,0,0,// Second column
    0,0,1,0,// Third column
    0,0,0,1,// Fourth column
]);

/**
 * Matrix multiplication function: multiplies two 4x4 matrices
 * @param {Float32Array} a
 * @param {Float32Array} b
 * @returns {Float32Array}
 */
function matMul(a, b) {
    let out = new Float32Array(16);// Create an array to store the result
    // Multiply columns and rows of matrices `a` and `b`
    for (let i = 0; i < 4; i++) {// Iterate through each column
        // Iterate through each row
        for (let j = 0; j < 4; j++) {
			 // Perform matrix multiplication for each element
            out[i + j*4] = a[i]*b[4*j] + a[i+4]*b[4*j+1] + a[i+8]*b[4*j+2] + a[i+12]*b[4*j+3];
        }
    }
    return out; // Return the resulting matrix
}

/**
 * Generates a perspective matrix to simulate 3D space in WebGL
 * @param {number} fovy
 * @param {number} aspect
 * @param {number} near
 * @param {number} far
 * @returns {Float32Array}
 */
function genPerspective(fovy, aspect, near, far) {
	// Calculate the perspective projection (how things shrink as they move away)
    // Citation: https://webglfundamentals.org/webgl/lessons/webgl-3d-perspective.html
    var f = Math.tan(Math.PI * 0.5 - 0.5 * fovy);// Focus factor for field of view
    var rangeInv = 1.0 / (near - far);// Inverted range between near and far planes
    
	// Return the perspective matrix
    return new Float32Array([
      f / aspect, 0, 0, 0,// Scale x based on aspect ratio
      0, f, 0, 0,          // Scale y based on field of view
      0, 0, (near + far) * rangeInv, -1, // Perspective depth scaling
      0, 0, near * far * rangeInv * 2, 0  // Perspective division and depth
    ]);
}

/**
 * Creates a scaling matrix to make objects bigger or smaller in x, y, and z axes
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {Float32Array}
 */
function scale(x, y=x, z=x) {
    return new Float32Array([
      x, 0, 0, 0,// Scale x-axis
      0, y, 0, 0,// Scale y-axis
      0, 0, z, 0,// Scale z-axis
      0, 0, 0, 1, // No scaling in w-axis
    ]);
}

/**
 * Creates a translation matrix to move objects in 3D space
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {Float32Array}
 */
function translate(x, y, z) {
    return new Float32Array([
      1, 0, 0, 0,// No change to x scale
      0, 1, 0, 0,// No change to y scale
      0, 0, 1, 0,// No change to z scale
      x, y, z, 1, // Translation vector (x, y, z)
    ]);
}

/**
 * Creates a rotation matrix for rotating around the X-axis
 * @param {number} angle
 * @returns {Float32Array}
 */
function rotX(angle) {
    return new Float32Array([
      1, 0, 0, 0,// No change to x-axis
      0, Math.cos(angle), Math.sin(angle), 0,// Rotate in the y-z plane
      0, -Math.sin(angle), Math.cos(angle), 0,// Rotate in the z-y plane
      0, 0, 0, 1,// No change to w-axis
    ]);
}

/**
 * Creates a rotation matrix for rotating around the Y-axis
 * @param {number} angle
 * @returns {Float32Array}
 */
function rotY(angle) {
    return new Float32Array([
      Math.cos(angle), 0, -Math.sin(angle), 0,// Rotate in the x-z plane
      0, 1, 0, 0,// No change to y-axis
      Math.sin(angle), 0, Math.cos(angle), 0,// Rotate in the z-x plane
      0, 0, 0, 1, // No change to w-axis
    ]);
}

/**
 * Creates a rotation matrix for rotating around the Z-axis
 * @param {number} angle
 * @returns {Float32Array}
 */
function rotZ(angle) {
    return new Float32Array([
      Math.cos(angle), -Math.sin(angle), 0, 0,// Rotate in the x-y plane
      Math.sin(angle), Math.cos(angle), 0, 0,// Rotate in the y-x plane
      0, 0, 1, 0,// No change to z-axis
      0, 0, 0, 1,// No change to w-axis
    ]);
}

/**
 * Compiles the WebGL program containing the vertex and fragment shaders
 * @param {WebGLRenderingContext} gl
 */
function compileProgram(gl) {
	// Create a program to store shaders
    program = gl.createProgram();
    if (!program) { throw "Failed to create program."; }
    // Create and compile the vertex shader (handles positioning of vertices)
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) { throw "Failed to create vertex shader."; }
    
    gl.shaderSource(vertexShader, `
    #version 100
    
    attribute vec3 position;// Position of the vertex
    
    uniform mat4 perspective;// Perspective matrix for 3D projection
    uniform mat4 model;// Model matrix for object transformation

    varying vec3 v_pos;// Varying variable to pass to fragment shader

    void main() {
        v_pos = position;// Pass vertex position to fragment shader
        gl_Position = perspective * model * vec4(position, 1.0);// Calculate final vertex position
    }
    `);
    gl.compileShader(vertexShader);// Compile the vertex shader
    // Check for errors in the vertex shader compilation
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(vertexShader);
        console.error(info);
        throw "Failed to compile vertex shader.";
    }
    // Create and compile the fragment shader (handles color of each pixel)
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragShader) { throw "Failed to create fragment shader."; }
    
    gl.shaderSource(fragShader, `
    #version 100

    precision highp float;

    uniform vec3 colour;
    uniform int render_mode;
    uniform float time;

    varying vec3 v_pos;

    float f(float H, float S, float V, float n) {
        float k = n + H/60.0;

        for (int i = 0; i < 10; i++) {
            if (k >= 6.0) {
                k -= 6.0;
            } else {
                break;
            }
        }

        return V - V*S*max(0.0, min(k, min(4.0-k, 1.0)));
    }

    vec3 hsvToRgb(float H, float S, float V) {
        return vec3(f(H, S, V, 5.0), f(H, S, V, 3.0), f(H, S, V, 1.0));
    }

    void main() {
        vec4 final = vec4(0.0);
        if (render_mode == 0) {
            final = vec4(colour, 1.0);
        } else if (render_mode == 1) {
            if (length(v_pos) > 0.5) {
                discard;
            }
            float d = dot(v_pos, vec3(-0.707, 0.707, 0.0)) / 2.0;
            final = vec4(colour + d*vec3(1.0) - length(v_pos)*length(v_pos), 1.0);
        } else if (render_mode == 2) {
            final = vec4(colour * (v_pos.y + 10.0) / 10.5, 1.0);
        } else if (render_mode == 3) {
            final = vec4(hsvToRgb((sin(time/500.0)+1.0)*20.0, 1.0, 0.9), 1.0);
        }
        gl_FragColor = final;
    }
    `);
    gl.compileShader(fragShader);

    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(fragShader);
        console.error(info);
        throw "Failed to compile fragment shader.";
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragShader);

    gl.viewport(0, 0, 800, 600);

    gl.linkProgram(program);

    gl.useProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        console.error(info);
        throw "Failed to link program.";
    }
}

let lastWidth;
let lastHeight;

// let ball = new Sphere(new Vec2(-0.05, 0.05), 0.025);
/** @type {Sphere | undefined} */
let ball;
let ballVel = new Vec2(0, 0);

let rot = 0;
let targetRot = 0;
let acc = new Vec2(0, 0);

let lastTime;
let dt = 0;

let currentFrame = 0;

/** @type {undefined | {
 *      id: string,
 *      status: 'waiting' | 'playing' | 'finished',
 *      gravityAngle: number,
 *      winner: string,
 *      boardSize: number,
 *      walls: [{t: boolean, l: boolean}],
 *      players: Object.<string, {
 *          playerId: string,
 *          username: string,
 *          gravityAngle: number,
 *          x: number, y: number,
 *          vx: number, vy: number,
 *          lastPoll: number,
 *          score: number,
 *      }>,
 *      powerUps: [{x: number, y: number, skill: '0g', holder: string, timeActivated: number}]
 * }} */
let lobbyState;
/**
 * @type {Object.<string, {
 *     playerId: string,
*      x: number, y: number,
*  }>}
 */
let playerPositions = {};
let latestLobbyTime = 0;

function main() {
    /*Get the canvas element by its ID*/
    canvas = /**@type {HTMLCanvasElement | null}*/(document.getElementById("canvas"));
   /*Initialise the WebGL context from the canvas,Im using this since i want my maze to be 3D*/
    gl = canvas?.getContext("webgl");
    /*Check if WebGL is supported*/
    if (!gl) { throw "Failed to initialise canvas. Your browser or device may not support it."; }
   /*Enable depth testing to handle 3D object overlap properly*/
    gl.enable(gl.DEPTH_TEST);
   /*Set the background color to red using RGBA Format*/
    gl.clearColor(1.0,0.0,0.0,1.0);//Red colour with full opacity
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    /*Compile and link the WebGL program(shaders)*/
    compileProgram(gl);
    /*Enable the vertex attribute at index 0*/
    gl.enableVertexAttribArray(0);
    /*Create a buffer and bind it to store vertex position for a quad */
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0,
        -0.5,  0.5, 0.0,
        -0.5, 0.5, 0.0,
        0.5, -0.5, 0.0,
        0.5, 0.5, 0.0,
    ]),
    gl.STATIC_DRAW);
   /*Define how to read the vertex data(3 values per vertex,floating point)*/
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
   /*Check if the device supports orientation events*/
    if (window.DeviceOrientationEvent) {
        window.addEventListener('devicemotion', (event) => {
            const a = event.accelerationIncludingGravity
            const b = event.acceleration;

            if (!a?.x || !b?.x || !a?.y || !b?.y || !a?.z || !b?.z) return;

            const gx = a.x - b.x;
            const gy = a.y - b.y;

            let angle = Math.atan2(gy, gx);

            if (angle < -Math.PI/2) {
                angle += Math.PI*2;
            }

            targetRot = targetRot*4/5 + (angle - Math.PI/2)/5;
            // targetRot = angle - Math.PI/2;

            acc.x = -b.x * Math.cos(rot - targetRot) + b.y * Math.sin(rot - targetRot);
            acc.y = -b.x * Math.sin(rot - targetRot) - b.y * Math.cos(rot - targetRot);
        }, false);
    } else {
        throw "Doesn't support device orientation.";
    }
   /*Initialize the ball if the player exists*/
    if (player) {
        ball = new Sphere(new Vec2(-0.05, 0.4), 0.025);
    }
   /*Update the lobby element with the lobby ID*/
    let lobbyElem = document.getElementById("lobby");
    if (lobbyElem) {
        lobbyElem.innerText = lobbyId+"";
    }
    /*Start polling for updates*/
    poll();
   /*Request a wake lock to keep the screen on if supported*/
    if ('wakeLock' in navigator) {
        navigator.wakeLock.request();
    }
  /*Start the rendering loop*/
    requestAnimationFrame(draw);
}

function drawObject(gl, r, g, b, renderMode, model) {
    let loc = gl.getUniformLocation(program, "colour");
    gl.uniform3f(loc, r, g, b);

    loc = gl.getUniformLocation(program, "render_mode");
    gl.uniform1i(loc, renderMode);

    loc = gl.getUniformLocation(program, "model");
    gl.uniformMatrix4fv(loc, false, model);

    loc = gl.getUniformLocation(program, "time");
    gl.uniform1f(loc, lastTime);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}


let lobbyElem = document.getElementById("lobby");
let colourElem = document.getElementById("col");
let winElem = document.getElementById("winScreen");

let lastStatus = 'waiting';

/**
 * @param {DOMHighResTimeStamp} time
 */
function draw(time) {
    if (!lastTime) lastTime = time;
    
    dt = Math.min((time - lastTime) / 1000.0, 1/30.0);
    lastTime = time;
    

    if (!canvas || !gl || !vertexBuffer || !program) {
        return;
    }
    if (!lobbyState) {
        requestAnimationFrame(draw);
        return;
    }
    
    if (currentFrame % 5 == 0) {
        poll();
    }

    if (colourElem && player && lobbyState) {
        let i = Object.keys(lobbyState.players).findIndex(p => p == player);
        const colour = ballColours[i];
        colourElem.style.color = "rgb("+colour[0]+", "+colour[1]+", "+colour[2]+")";
        colourElem.innerText = ballColourNames[i];

        let colourDiv = document.getElementById("playerColour");
        if (colourDiv) {
            colourDiv.style.display = "block";
        }
    }

    if (player && ball && lobbyState.status == "waiting") {
        let index = Object.keys(lobbyState.players).findIndex(p => p === player);
        ball.centre.y = 0.5 - 0.5 / lobbyState.boardSize;
        ball.centre.x = Math.round((index + 1) / (Object.keys(lobbyState.players).length + 1) * lobbyState.boardSize) / lobbyState.boardSize - 0.5 - 0.5 / lobbyState.boardSize;
    }
    if (lobbyState.status === 'finished') {
        if (winElem && lastStatus !== 'finished') {
            winElem.style.display = "flex";
            let playerElem = document.getElementById("winPlayer");
    
            let players = lobbyState.players;
    
            let playerTuples = Object.keys(players).map(playerId => {
                return {
                    player: playerId,
                    score: players[playerId].score,
                }
            });
            playerTuples.sort((a, b) => b.score - a.score);
    
            for(let i = 0; i < 4; i++) {
                let leaderBoard  = document.getElementById("playerScore"+(i+1))
                if (leaderBoard) {
                    if (i < Object.keys(players).length) {
                        leaderBoard.style.display = "flex";
                        leaderBoard.getElementsByClassName("playerName")[0].innerHTML = players[playerTuples[i].player].username;
                        leaderBoard.getElementsByClassName("playerScore")[0].innerHTML = playerTuples[i].score+""
                    } else {
                        leaderBoard.style.display = "none";
                    }
                }
            }
    
            if (playerElem) {
                let i = Object.keys(lobbyState.players).findIndex(p => p === lobbyState?.winner);
                if(players[lobbyState.winner]){
                    // @ts-ignore
                    playerElem.innerText = players[lobbyState.winner].username;
                }
            }
            let winModal = document.getElementById("btnWin");
            winModal.click();
            let audio = new Audio('/victory.mp3');
            audio.play();
        }
    } else {
        if (winElem) {
            winElem.style.display = "none";
        }
    }

    let startElem = document.getElementById("startButton");
    if (startElem && player === null) {
        // @ts-ignore
        if (lobbyState?.status === 'waiting') {
            startElem.style.display = "flex";
        } else {
            startElem.style.display = "none";
        }
    }

    let resetElem = document.getElementById("resetButton");
    if (resetElem && player === null) {
        if (lobbyState?.status === 'finished' || lobbyState?.status === 'playing') {
            resetElem.style.display = "flex";
        } else {
            resetElem.style.display = "none";
        }
    }

    currentFrame += 1;

    let width = window.innerWidth * window.devicePixelRatio;
    let height = window.innerHeight * window.devicePixelRatio;
    
    canvas.width = width;
    canvas.height = height;

    if (!perspective || lastWidth !== width || lastHeight !== height) {
        perspective = genPerspective(Math.max(Math.atan(height / width) * 1.5, 1.0), width / height, 0.1, 100.0);
        lastWidth = width;
        lastHeight = height;
    }

    gl.viewport(0, 0, width, height);

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // perspective matrix
    let loc = gl.getUniformLocation(program, "perspective");
    gl.uniformMatrix4fv(loc, false, perspective);

    gl.clearColor(0.5, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    rot = rot*4/5 + lobbyState.gravityAngle/5;

    const boardRot = rotZ(player ? (rot - targetRot) : rot);

    const board = matMul(translate(0, 0, -1.5), boardRot);

    drawObject(gl, 78/255, 103/255, 102/255, 0, board);

    const cap = matMul(translate(0.0, 0.5, 0.0), matMul(rotX(Math.PI/2), scale(1.0, 0.005, 1.0)));

    let size = lobbyState.boardSize;

    let wh = wallHeight / size;

    for (let i = 0; i < size+1; i++) {
        for (let j = 0; j < size+1; j++) {
            if (i < size && lobbyState.walls[j+(size+1)*i].t) {
                const wall = matMul(translate(-0.5 + 0.5/size + i/size, 0.5 - j/size, wh/2), matMul(rotX(Math.PI/2), scale(1/size, wh, 1.0)));
                
                // wall
                drawObject(gl, 90/255, 177/255, 187/255, 2, matMul(board, wall));

                // cap
                drawObject(gl, 120/255, 241/255, 255/255, 0, matMul(board, matMul(wall, cap)));
            }

            if (j < size && lobbyState.walls[j+(size+1)*i].l) {
                const wall = matMul(translate(-0.5 + i/size, 0.5 - 0.5/size - j/size, wh/2), matMul(rotZ(Math.PI/2), matMul(rotX(Math.PI/2), scale(1/size, wh, 1.0))));
                
                // wall
                drawObject(gl, 90/255, 177/255, 187/255, 2, matMul(board, wall));

                // cap
                drawObject(gl, 120/255, 241/255, 255/255, 0, matMul(board, matMul(wall, cap)));
            }
        }
    }

    let zeroGs = lobbyState.powerUps.filter(powerUp => powerUp.holder === player && powerUp.skill === '0g');
    if (!zeroGs.length && clock0gWrapper) {
        clock0gWrapper.style.display = "none";
    }
    zeroGs.sort((a,b) => a.timeActivated - b.timeActivated);
    for (let i = 0; i < zeroGs.length; i++) {
        if (clock0gWrapper && clock0g) {
            let angle = (new Date().getTime() - zeroGs[i].timeActivated) / 7500 * 360;
            
            clock0gWrapper.style.display = "flex";
            clock0g.style.background = `conic-gradient(transparent 0deg ${angle}deg, white ${angle}deg 360deg)`;
        }
    }

    for (let i = 0; i < lobbyState.powerUps.length; i++) {
        const powerUp = lobbyState.powerUps[i];

        if (powerUp.holder) {
            continue;
        }

        const px = -0.5 + 0.5/size + powerUp.x/size;
        const py = 0.5 - 0.5/size - powerUp.y/size;

        const model = matMul(translate(px, py, 0.025), matMul(rotZ(time / 10.0), scale(0.5/size, 0.5/size)));

        drawObject(gl, 1.0, 0.5, 0.5, 3, matMul(board, model));

        if (player && ball && lobbyState.status === 'playing') {
            let aabb = new AABB(new Vec2(px - 0.3/size, py - 0.3/size), new Vec2(px + 0.3/size, py + 0.3/size));
            if (aabb.collideSphere(ball)) {
                fetch("/lobby/powerup?" + new URLSearchParams({ lobby: lobbyId, player: player+"", px: powerUp.x+"", py: powerUp.y+"" })).then(data => {
                    data.json().then(json => {
                        if (json.error) {
                            alert(json.error);
                            lobbyState = undefined;
                            return;
                        }
                    }).catch(err => {
                        alert(err);
                        lobbyState = undefined;
                    });
                }).catch(err => {
                    alert(err);
                    lobbyState = undefined;
                });
            }
        }
    }

    if (ball) {
        ball.radius = 0.25 / lobbyState.boardSize;
    }

    if (ball && lobbyState.status == 'playing') {
        let p = lobbyState.powerUps.find(powerUp => powerUp.holder === player && powerUp.skill === '0g');
        if (!p) {
            ballVel.x -= 1.0*dt*-Math.sin(rot);
            ballVel.y -= 1.0*dt*Math.cos(rot);
        }
    
        ballVel.x += acc.x * dt;
        ballVel.y += acc.y * dt;
        
        const numSteps = Math.ceil(ballVel.length() / 0.05);
        
        for (let i = 0; i < numSteps; i++) {
            ball.centre.x += ballVel.x*dt / numSteps;
            ball.centre.y += ballVel.y*dt / numSteps;

            runCollisions(dt / numSteps);
        }
    }

    let keys = Object.keys(lobbyState.players);

    for (let i = 0; i < keys.length; i++) {
        const p = lobbyState.players[keys[i]];

        if (!(p.playerId in playerPositions)) {
            playerPositions[p.playerId] = {
                playerId: p.playerId,
                x: p.x,
                y: p.y,
            };
        }

        playerPositions[p.playerId].x = playerPositions[p.playerId].x*3/4 + p.x/4;
        playerPositions[p.playerId].y = playerPositions[p.playerId].y*3/4 + p.y/4;

        let br = 0.25 / lobbyState.boardSize;
        let bx = (player === keys[i] && ball) ? ball.centre.x : playerPositions[p.playerId].x;
        let by = (player === keys[i] && ball) ? ball.centre.y : playerPositions[p.playerId].y;

        const ballModel = matMul(translate(0,0,-1.5), matMul(boardRot, matMul(translate(bx, by, 0.05), scale(br*2))));

        // ball
        const colour = ballColours[i];
        drawObject(gl, colour[0]/255, colour[1]/255, colour[2]/255, 1, ballModel);

        // if (lobbyState.status === 'playing') {
        //     p.x += p.vx * dt;
        //     p.y += p.vy * dt;
        //     p.vx *= 0.8;
        //     p.vy *= 0.8;
        // }
    }

    lastStatus = lobbyState.status;

    requestAnimationFrame(draw);
}

const extendBox = 0.25;

/**
 * @param {number} dt
 * @param {number | undefined} until
 * @returns 
 */
function runCollisions(dt, until=undefined) {
    if (!ball || !lobbyState) return;

    let size = lobbyState.boardSize;

    if (until === undefined) {
        until = (size+1)*(size+1);
    }

    let bx = Math.round((ball.centre.x + 0.5) * size);
    let by = Math.round(-(ball.centre.y - 0.5) * size);

    for (let i = Math.max(bx - 2, 0); i < Math.min(bx + 2, size+1); i++) {
        for (let j = Math.max(by - 2, 0); j < Math.min(by + 2, size+1); j++) {
            let idx = j + i*(size+1);
            // there is a wall here
            if (i < size && lobbyState.walls[idx].t) {
                let extend = extendBox / size;
                const wallLeft = -0.5 + (i - extend)/size;
                const wallY = 0.5 - j/size;
    
                const wall = new AABB(new Vec2(wallLeft, wallY-extend/size), new Vec2(wallLeft+(1+extend*2)/size, wallY+extend/size));
    
                if (wall.collideSphere(ball)) {
                    // Citation: https://www.gamedev.net/forums/topic/544686-sphere-aabb-collision-repsonse/544686/
    
                    const pbox = wall.closestPoint(ball.centre);
    
                    let delta = pbox.sub(ball.centre);
                    delta = delta.mul(ball.radius / (delta.length()+0.0001));
    
                    let psphere = ball.centre.add(delta);
                    
                    const push = pbox.sub(psphere);
    
                    ball.centre = ball.centre.add(push.mul(0.5));
    
                    ballVel = ballVel.add(push.mul(0.02/dt));
                }
            }
            // there is a wall here
            if (j < size && lobbyState.walls[idx].l) {
                const wallX = -0.5 + i/size;
                const wallBottom = 0.5 - (j+1)/size;
                
                const wall = new AABB(new Vec2(wallX-0.05/size, wallBottom), new Vec2(wallX+0.05/size, wallBottom+1/size));
    
                if (wall.collideSphere(ball)) {
                    // Citation: https://www.gamedev.net/forums/topic/544686-sphere-aabb-collision-repsonse/544686/
    
                    const pbox = wall.closestPoint(ball.centre);
    
                    let delta = pbox.sub(ball.centre);
                    delta = delta.mul(ball.radius / (delta.length()+0.0001));
    
                    const psphere = ball.centre.add(delta);
                    
                    const push = pbox.sub(psphere);
    
                    ball.centre = ball.centre.add(push.mul(0.5));
    
                    ballVel = ballVel.add(push.mul(0.02/dt));
                }
            }
        }
    }
}

function poll() {
    let params = { lobby: lobbyId, timestamp: new Date().getTime()+"" };
    if (player && ball) {
        params.player = player;
        params.bx = ball.centre.x+"";
        params.by = ball.centre.y+"";
        params.vx = ballVel.x+"";
        params.vy = ballVel.y+"";
        params.gravity = targetRot+"";
        if (ball.centre.y < -0.53) {
            params.win = "";
        }
    }

    fetch("/lobby/poll?" + new URLSearchParams(params)).then(data => {
        data.json().then(json => {
            if (json.error) {
                alert(json.error);
                lobbyState = undefined;
                return;
            }
            if (latestLobbyTime < json.timestamp) {
                lobbyState = json.lobby;
            }
        }).catch(err => {
            alert(err);
            lobbyState = undefined;
        });
    }).catch(err => {
        alert(err);
        lobbyState = undefined;
    });
}

try {
    main();
} catch (error) {
    alert(error);
}
