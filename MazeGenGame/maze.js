/*PURPOSE: This code will be responsible for maze generation by carving out passages
           between cells and returns the maze structure.It uses recursive backtracking to build the maze,
           ensuring that all cells are connected.*/

class Maze {
    //Construtor initializes the maze with all its walls intact,containing a width and height.
    constructor(width, height) {
        this.width = width;
        this.height = height;
        //Create an array of cells.Each cell will having 4 walls represented by [top, right, bottom, left].
        this.grid = Array.from({ length: height }, () => Array.from({ length: width }, () => [true, true, true, true]));
    }
    //Check if cell is within maze boundaries.
    isInBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
//Get the neighboring cells of a given cell (x, y) and their corresponding wall directions.
    getNeighbors(x, y) {
        const neighbors = [];
        // Check and add neighbors (top, right, down, left) if they're within bounds.
        if (this.isInBounds(x, y - 1)) neighbors.push([x, y - 1, 0, 2]); // top
        if (this.isInBounds(x + 1, y)) neighbors.push([x + 1, y, 1, 3]); // right
        if (this.isInBounds(x, y + 1)) neighbors.push([x, y + 1, 2, 0]); // down
        if (this.isInBounds(x - 1, y)) neighbors.push([x - 1, y, 3, 1]); // left
        return neighbors;
    }
/*Randomly shuffle the given array using the Fisher-Yates algorithm.This will help 
in ensuring that a unique maze is created each time or for every new game.*/
    
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
//Carves passages starting from a given cell (cx, cy) by removing walls.
    carvePassagesFrom(cx, cy) {
        // Get the neighboring cells and shuffle them for randomness.
        const directions = this.getNeighbors(cx, cy);
        this.shuffle(directions);
      // Process each neighbor in the shuffled order.
        for (const [nx, ny, fromDir, toDir] of directions) {
            // Check if all walls of the neighbor cell are intact (not yet visited).
            if (this.grid[ny][nx][0] && this.grid[ny][nx][1] && this.grid[ny][nx][2] && this.grid[ny][nx][3]) { // if all walls are intact
                this.grid[cy][cx][fromDir] = false; // remove the wall between the current cell and the neighbor
                this.grid[ny][nx][toDir] = false; // remove the wall between the neighbor and the current cell
                this.carvePassagesFrom(nx, ny); // recurse into the neighbor cell
            }
        }
    }
//Generates the maze by carving passages starting from the top-left corner (0, 0).
    generate() {
        this.carvePassagesFrom(0, 0); // start carving from the top-left corner.
        return this.grid;//Return the maze with walls.
    }
}
// Export a function that generates a maze of a given size.
module.exports = function generateMaze(size) {
    const maze = new Maze(size, size);
    let mazeData = maze.generate();//Generate the maze.
 // Transform the maze grid into a format with 'l' for left wall and 't' for top wall
    var newData = [];
// Loop through each cell and create the maze layout
    for(let i = 0; i < size; i++) {
        for(let j = 0; j < size; j++) {
           // Push the left and top walls of each cell into newData
            newData.push({
                l: mazeData[j][i][3],
                t: mazeData[j][i][0]
            });
        }
        // Add a false left and true top wall to close the row at the edge
        newData.push({
            l: false,
            t: true
        });
    }
    // Add the bottom row of walls to close the maze at the bottom
    for(let i = 0; i < size; i++) {
        newData.push({
            l: true,
            t: false
        });
    }
/* Randomly remove some walls (left and top) with a probability of 10%*/
    for(let i = 1; i < size; i++) {
        for(let j = 1; j < size; j++) {
            if(Math.random() < 0.1) {
                newData[i*(size+1)+j].l = false;// Remove left wall with 10% probability
            }
            if(Math.random() < 0.1) {
                newData[i*(size+1)+j].t = false// Remove top wall with 10% probability
            }
        }
    }
    // Add a final cell with no walls at the bottom-right corner to complete the maze
    newData.push({
        l: false,
        t: false
    });
// Return the transformed maze data
    return newData;
}
