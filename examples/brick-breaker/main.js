/**
 * Brick Breaker
 * -------------
 * An example of a complete, yet simple game.
 */

// Our "Brick Breaker" namespace. BB for shorter code.
BB = {};
// A refererence to our game. Just for shorter code.
BB.game = SGF.Game.current;

// The resolution of the game.
BB.GAME_WIDTH = 320;
BB.GAME_HEIGHT = 240;

// Hide the native cursor.
SGF.Screen.showNativeCursor(false);

// Create a background
BB.bg = new SGF.Rectangle({
    width: BB.GAME_WIDTH,
    height: BB.GAME_HEIGHT,
    color: "000000",
    zIndex: 0
});
BB.game.addComponent(BB.bg);

// First load some dependencies.
SGF.Game.current.loadScript("Paddle.js", function() {
    SGF.Game.current.loadScript("Ball.js", function() {
        
        BB.newBall = function() {
            // The ball. A new one is created each life.
            BB.ball = new BB.Ball({ paddle : BB.paddle, color:"Red" });
            BB.game.addComponent(BB.ball);
        };


        // Paddle instance. There is only one for the duration of the game.
        BB.paddle = new BB.Paddle();
        this.addComponent(BB.paddle);


        BB.newBall();


        SGF.Input.observe("mousedown", function() {
            BB.ball.launch();
        });
    });
});