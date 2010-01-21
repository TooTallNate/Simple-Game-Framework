/**
 * Brick Breaker
 * -------------
 * An example of a complete, yet simple game.
 */

// Our "Brick Breaker" namespace. BB for shorter code.
BB = {};
// A refererence to our game. Just for shorter code.
BB.game = SGF.Game.current;
// Set the engine to call 'update()' 50 times per second.
BB.game.setGameSpeed(50);

// The resolution of the game. We keep it hard coded just for simplicity,
// a "good" game might be dynamic based on a variable screen size.
BB.GAME_WIDTH = 400;
BB.GAME_HEIGHT = 300;

// Create a background
BB.bg = new SGF.Rectangle({
    width: BB.GAME_WIDTH,
    height: BB.GAME_HEIGHT,
    color: "292929", // Dark Grey
    zIndex: 0
});
BB.game.addComponent(BB.bg);

// Set the area outside our hard coded screen to solid black
SGF.Screen.color = "000000";

// First load some dependencies.
BB.game.loadScript("Brick.js", function() {
    BB.game.loadScript("Paddle.js", function() {
        BB.game.loadScript("Ball.js", function() {

            BB.ballsUsed = 0;

            BB.newBall = function() {
                // The ball. A new one is created each life.
                BB.ball = new BB.Ball();
                // Add it onto the screen and into the game loop.
                BB.game.addComponent(BB.ball);
                // Increment the number of lives used.
                BB.ballsUsed++;
            };

            BB.gameOver = function() {
                BB.ball.gameOver();
                BB.paddle.gameOver();
                BB.goOverlay = new SGF.Rectangle({
                    width:   BB.GAME_WIDTH,
                    height:  BB.GAME_HEIGHT,
                    color:   "000000", // Black
                    zIndex:  10,       // Appear above everything else
                    opacity: 0.5       // 50% Transparent
                });
                BB.game.addComponent(BB.goOverlay);
            }


            // Paddle instance. There is only one for the duration of the game.
            BB.paddle = new BB.Paddle();
            this.addComponent(BB.paddle);

            // Start the game with a new ball.
            BB.newBall();


            BB.initBricks([  [0,0,1,1,1,1,0,0],
                             [0,1,0,1,1,0,1,0],
                             [0,1,0,1,1,0,1,0],
                             [0,0,1,1,1,1,0,0],
                             [0,1,0,0,0,0,1,0],
                             [0,0,1,1,1,1,0,0],
                             [0,0,0,1,1,0,0,0]  ]);

            BB.startTime = new Date();
        });
    });
});
