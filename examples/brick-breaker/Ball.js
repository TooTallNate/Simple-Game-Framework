BB.Ball = Class.create(SGF.Rectangle, {
    initialize: function($super) {
        $super({
            color  : "f47111",
            zIndex : 5
        });

        // Track mouse button presses to launch the ball.
        this.bindedLaunch = this.launch.bind(this);
        SGF.Input.observe("mousedown", this.bindedLaunch);

        this.launched = false;
        this.alive = true;
        this.followPaddle();
    },
    update: function($super) {
        $super();

        // If the ball's been launched, continue with collision detection logic
        if (this.launched) {
            // First check screen bounds
            if (this.right() >= BB.GAME_WIDTH || this.left() <= 0)
                  this.dx = -this.dx;
            else if (this.top() <= 0)
                  this.dy = -this.dy;
            // Next check if we've hit the paddle
            else if (this.left() >= BB.paddle.left() && this.right() <= BB.paddle.right() && this.bottom() >= BB.paddle.top()) {
                this.dx = 8 * ((this.x-(BB.paddle.x+BB.paddle.width/2))/BB.paddle.width);
                this.dy = -Math.abs(this.dy);
            // Next check the bottom of the screen (lose a life)
            } else if (this.bottom() >= BB.GAME_HEIGHT)
                this.die();
            // Finally check if we've hit any of the balls.
            else if (BB.bricks.length > 0)
                BB.bricks.invoke("checkHit", this);

          
        } else {
            // Still attached to the Paddle, follow it.
            this.followPaddle();
        }
    },

    die: function() {
        this.alive = false;
        SGF.Game.current.removeComponent(this);
        BB.newBall();
    },
    
    gameOver: function() {
        this.dx = this.dy = 0;
        this.update = Prototype.emptyFunction;
        SGF.Input.stopObserving("mousedown", this.bindedLaunch);
    },

    followPaddle: function() {
        this.y = BB.paddle.top() - this.height + 1;
        this.x = BB.paddle.x + (BB.paddle.width/2) - (this.width/2);
    },

    launch: function() {
        if (this.launched === true) return;
        
        this.launched = true;
        this.y--;
        this.dy = -4;
    }
});
