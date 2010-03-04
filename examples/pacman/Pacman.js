
P.Pacman = new (Class.create(SGF.Sprite, {
    initialize: function($super) {
        var s = new SGF.Spriteset("pacman.gif", 16, 16);
        $super(s, {
            width: P.TILE_WIDTH,
            height: P.TILE_HEIGHT,
            zIndex:1
        });
        this.speed = 5;
        this.stepsTaken = 0;
    },
    update: function($super, updateCount) {
        $super(updateCount);

        this.isMoving = false;
        if (SGF.Input.isKeyDown(SGF.Input.KEY_UP)) {
            this.faceUp();
            this.dy = -this.speed;
            this.isMoving = true;
        } else if (SGF.Input.isKeyDown(SGF.Input.KEY_DOWN)) {
            this.faceDown();
            this.dy = this.speed;
            this.isMoving = true;
        } else {
            this.dy = 0;
        }
        if (SGF.Input.isKeyDown(SGF.Input.KEY_RIGHT)) {
            this.faceRight();
            this.dx = this.speed;
            this.isMoving = true;
        } else if (SGF.Input.isKeyDown(SGF.Input.KEY_LEFT)) {
            this.faceLeft();
            this.dx = -this.speed;
            this.isMoving = true;
        } else {
            this.dx = 0;
        }
        if (this.isMoving) {
            this.stepsTaken++;
            this.spriteY = parseInt((this.stepsTaken/4) % 2);
        }
    },

    faceUp: function() {
        this.rotation = (0).toRadians();
    },
    faceDown: function() {
        this.rotation = (180).toRadians();
    },
    faceLeft: function() {
        this.rotation = (270).toRadians();
    },
    faceRight: function() {
        this.rotation = (90).toRadians();
    }
}))();
