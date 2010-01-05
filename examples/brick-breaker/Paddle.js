BB.Paddle = Class.create(SGF.Rectangle, {
    initialize: function($super) {
        $super({
            width: 70,
            height: 12,
            color: "1184e5"
        });
        this.y = BB.GAME_HEIGHT - this.height - 10;
    },
    update: function($super) {
        //this.dx = this.dx * 0.9;
        this.x = (SGF.Input.pointerX - (this.width/2)).constrain(0, BB.GAME_WIDTH - this.width);
        $super();
    }
});