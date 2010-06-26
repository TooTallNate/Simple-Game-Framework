// Import required classes
var Game = SGF.require("Game");
var Input = SGF.require("Input");
var Rectangle = SGF.require("Rectangle");

// Get a reference to our Game instance
var myGame = Game.getInstance();
// Get a reference to our game's Input instance
var myInput = myGame.input;

// Create a new Rectangle colored red that responds to the up, down, left
// and right keys from player input.
var box = new Rectangle();
box.width = 15;
box.height = 20;
box.color = "FF0000"; // Red

// A Component (Rectangle is a Component) has it's "update" function called as
// frequently as the game's current game speed times per second (default 30).
box.update = function() {
    if (myInput.isKeyDown(Input.KEY_UP)) {
        this.y--;
    } else if (myInput.isKeyDown(Input.KEY_DOWN)) {
        this.y++;
    }
    if (myInput.isKeyDown(Input.KEY_LEFT)) {
        this.x--;
    } else if (myInput.isKeyDown(Input.KEY_RIGHT)) {
        this.x++;
    }
}

// Finally add our Rectangle instance to our game.
myGame.addComponent(box);
