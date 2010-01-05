BB.Ball = Class.create(SGF.Circle, {
    initialize: function($super, options) {
        this.launched = false;
        this.alive = true;
        $super(options);
        this.followPaddle();
    },
    update: function($super) {
        if (this.launched) {
            if (this.left() <= 0 || this.right() >= BB.GAME_WIDTH)
                this.dx = -this.dx;
            if (this.top() <= 0)
                this.dy = -this.dy;
            if (this.y >= BB.GAME_HEIGHT)
                this.die();
        } else {
            // Still attached to the Paddle, follow it.
            this.followPaddle();
        }

        $super();
    },

    die: function() {
        this.alive = false;
        SGF.Game.current.removeComponent(this);
        BB.newBall();
    },
    followPaddle: function() {
        this.y = this.paddle.top() - this.height + 1;
        this.x = this.paddle.x + (this.paddle.width/2) - (this.width/2);
    },

    launch: function() {
        if (this.launched === true) return;
        
        this.launched = true;
        this.dy = -3;
    }
})