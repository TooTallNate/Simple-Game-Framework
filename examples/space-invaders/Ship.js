SI.Ship = Class.create(SGF.Sprite, {
    initialize: function($super) {
        var s = new SGF.Spriteset("ship.gif", 30, 22);
        $super(s, {
            width: s.spriteWidth,
            height: s.spriteHeight
        });
        this.y = SGF.Screen.height - this.height - 5;
        this.shotsFired = 0;
        SGF.Input.observe("keydown", this.keyDown.bind(this));
    },
    update: function($super) {
        if (this.left() < 0) {
            this.dx = this.x = 0;
        } else if (this.right() > 320) {
            this.dx = 0;
            this.x = 320 - this.width;
        } else {
            if (SGF.Input.isKeyDown(SGF.Input.KEY_LEFT) && this.left() > 0) {
                this.dx = -5;
            } else if (SGF.Input.isKeyDown(SGF.Input.KEY_RIGHT)) {
                this.dx = 5;
            } else {
                this.dx = this.dx * 0.9;
            }
        }
        $super();
        this.x = this.x.constrain(0,320-this.width);
    },
    render: function($super, interpolation) {
        $super(interpolation);
    },
    fireShot: function() {
        SI.game.addComponent(new SI.Shot({
            x: this.x + (this.shotsFired % 2 == 0 ? 1 : this.width) - 4,
            y: this.y - 4
        }));
        this.shotsFired++;
    },
    keyDown: function(e) {
        if (SI.gameOver) return;

        if (e.keyCode == SGF.Input.KEY_1) {
            this.fireShot();
        }
    }
});