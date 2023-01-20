const CANVAS = document.querySelector('canvas');
const CTX = CANVAS.getContext("2d");
const BLOCKSIZE = 20;
let SPEED = 100;  // time required to travel one block of distance.


//Takes our canvas and divides it into a grid of an array of arrays that holds our positions. 
class Grid {
    static getCoordinates(grid, block) {
        let [gridX,gridY] = (block)
        let [x,y] = grid[gridX][gridY]
        return [x,y];   
    }
    static create() {
        const columns = CANVAS.width/BLOCKSIZE;
        const rows = CANVAS.height/BLOCKSIZE;
        let grid = [];
        for (let c = 0; c < columns; c++) {
            let column = [];
            for (let r=0; r < rows; r++) {
                let row = [c*BLOCKSIZE,r*BLOCKSIZE]
                column.push(row);
            }
            grid.push(column);
        }
        return grid;
    }
}


// Checks if an array is found within another array of arrays.
const collision = (arr, arrArr) => {
    return arrArr.some(a => {
        let [x,y] = [...a];
        let [c,d] = [...arr];
        if (x == c && y == d) {
            return true;
        }
    })
}


// Track arrow keys
let direction = '';
function trackDirection(event) {
    
    let keys = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'];
    if (keys.includes(event.key)) {
        direction = (event.key).replace(/Arrow/,'').toLowerCase()
    }
}
window.addEventListener("keydown", trackDirection);


// Manage the state of our game
class State {
    constructor(grid, status) {
        this.grid = grid;
        this.status = status; // start, playing, lost
        this.snake = new Snake(grid);
        this.apple = new Apple(grid, this.snake.position);
        this.score = 0;
    }
    static start() {
        return new State(Grid.create(), "start");
    }

    // Updates game status for next annimation
    update(direction) {
        this.snake.move(direction)
        // check for snake collision w/ wall or self
        if (this.snake.collision) this.status = 'game over';
        // check for apple consumption
        if (collision(this.apple.position, this.snake.position)){
            console.log('apple, yum.')
            this.snake.digest = true;
            this.score += 1;
            this.apple = new Apple(this.grid, this.snake.position);
        }
    }
}

class Snake {
    constructor(grid) {
        // Start by positioning our snake at the top middle of our grid. 
        let x = Math.floor(grid.length/2);
        let y = 1;
        this.position = [[x,y], [x,y+1],[x,y+2], [x,y+3], [x,y+4], [x,y+5]];
        this.direction = 'down';
        this.collision = false;
        this.digest = false;
        this.gridLimitX = grid.length;
        this.gridLimitY = grid[0].length;
    }
    move(newDirection) {
        // User has not moved yet
        if (newDirection == '') return;

        // Don't allow snake to fold back up on itself
        if (this.direction == 'down' && newDirection == 'up') newDirection = 'down';
        if (this.direction == 'up' && newDirection == 'down') newDirection = 'up';
        if (this.direction == 'left' && newDirection == 'right') newDirection = 'left';
        if (this.direction == 'right' && newDirection == 'left') newDirection = 'right';
        this.direction = newDirection;

        // Determine next head position.
        let [headX,headY] = this.position[this.position.length-1];   
        let [newHeadX,newHeadY] = [headX,headY];
        if (this.direction == 'down') newHeadY++;
        if (this.direction == 'up') newHeadY--;
        if (this.direction == 'left') newHeadX--;
        if (this.direction == 'right') newHeadX++;
        let nextPosition = [...this.position];
        nextPosition.push([newHeadX,newHeadY])
        
        // Determine next tail position. 
        if (this.digest) {   
            this.digest = false; // Yum, Apple.
        } else {
            nextPosition.shift(); // move our tail.
        }

        // Complete the move as long as we don't run into a wall or ourselves
        this.#detectCollision(nextPosition);
        if (!this.collision) {
            this.position = [...nextPosition]
        }
    }
    #detectCollision(nextPosition) {
        let [headBlockX,headBlockY] = nextPosition[nextPosition.length-1];
        // Check for wall collision.
        if (headBlockX > this.gridLimitX-1 || headBlockX < 0 || headBlockY <0 || headBlockY > this.gridLimitY-1) {
            this.collision = true;
        }
        // Check for self collision
        // Becuase we are checking the NEXT move we slice 1 block off of our tail because it won't be there when we move. 
        if (collision([headBlockX,headBlockY], this.position.slice(1))) {
            console.log("snake collided with self!");
            this.collision = true;
        }
    }   
}


class Apple {
    constructor (grid, snakePosition) {
        this.gridLimitX = grid.length;
        this.gridLimitY = grid[0].length;
        this.#randomlyPlaceApple(snakePosition);
    }
    #randomlyPlaceApple(snakePosition) {    
        const randomLocation = () => {
            let randomGridX = Math.floor(Math.random() * this.gridLimitX)
            let randomGridY = Math.floor(Math.random() * this.gridLimitY)
            return [randomGridX,randomGridY];
        }
        // Pick random location for apple. Pick again if we accidently place on top of snake.
        this.position = randomLocation()
        if (collision(this.position, snakePosition)) this.#randomlyPlaceApple(snakePosition);
    }
}


// Handles our drawing to the canvas & updating DOM elements.
class Display {
    draw(state) {  
        this.#clear();
        let snake = state.snake;
        let apple = state.apple;

        // Draw snake
        snake.position.map(block => {  
            let [x,y] = Grid.getCoordinates(state.grid, block);
            CTX.beginPath(); 
            CTX.rect(x, y, BLOCKSIZE, BLOCKSIZE);
            CTX.fillStyle = '#235e23';
            CTX.fill();
            CTX.stroke();
        });
        
        // Draw apple
        let [appleGridX,appleGridY] = apple.position;
        let [appleX, appleY] = state.grid[appleGridX][appleGridY]
        CTX.beginPath();
        CTX.font = `${BLOCKSIZE}px Arial`;
        CTX.fillText("🍎", appleX-(BLOCKSIZE/6.6) ,appleY+(BLOCKSIZE/1.25)); //Trial and error to center apple in grid
    }
    #clear() {
        CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    }
    updateGameInfo(state) {
        let score = document.querySelector('#score');
        let best = document.querySelector('#best');
        score.innerText = state.score;
        if (state.score > Number(best.innerText)) {
            best.innerText = state.score;
        }
    }
}


export const  runGame = async (speed) => {
    return new Promise((resolve) => {
        direction = '';

        if (speed == 'fast') {
            SPEED = 40;
        } else if (speed == 'slow') {
            SPEED = 200;
        } else {
            SPEED = 100;
        }

        // Create our display. Display draws our snake.
        let display = new Display();
        
        // Create our state. State keeps track of the game, grid, and snake positions.
        let state = State.start()
        display.draw(state);

        // loop here for annimation of game.
        function frame(timeStamp) {
            // requestAnimationFrame callback is automatically passed timestamp. We arn't using it for our annimations
            if (state.status == 'game over') {
                setTimeout(() =>{
                    resolve("game over");
                },500);
            } else {
                setTimeout(() => {    
                    state.update(direction)
                    display.draw(state);
                    display.updateGameInfo(state);
                    requestAnimationFrame(frame)
                }, SPEED)  
            }
        }
        requestAnimationFrame(frame);
    });
}