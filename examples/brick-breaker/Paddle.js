BB.Paddle = Class.create(SGF.Rectangle, {
    initialize: function($super) {
        $super({
            width: 75,
            height: 10,
            color: "1184e5"
        });
        this.y = BB.GAME_HEIGHT - this.height;
        this.bindedOnMouseMove = this.onMouseMove.bind(this);
        SGF.Input.observe("mousemove", this.bindedOnMouseMove);
    },
    
    update: function($super) {
        $super();

        if (SGF.Input.isKeyDown(SGF.Input.KEY_LEFT))
            this.dx = -5;
        else if (SGF.Input.isKeyDown(SGF.Input.KEY_RIGHT))
            this.dx = 5;
        else
            this.dx = 0;

        this.x = Math.min(Math.max(0, this.x), BB.GAME_WIDTH-this.width);
    },

    gameOver: function() {
        this.dx = 0;
        this.update = Prototype.emptyFunction;
        SGF.Input.stopObserving("mousemove", this.bindedOnMouseMove);
    },

    onMouseMove: function(e) {
        if (e.x >= 0 && e.x <= BB.GAME_WIDTH) {
            this.x = Math.min(Math.max(0, e.x - (this.width/2)), BB.GAME_WIDTH-this.width);
        }
    }
});
