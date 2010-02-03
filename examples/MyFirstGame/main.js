var Box = Class.create(SGF.Rectangle, {
    initialize: function($super) {
        $super({
            width: 15,
            height: 20,
            color: "FF0000"
        });
    },
    update: function() {
        if (SGF.Input.isKeyDown(SGF.Input.KEY_UP)) {
            this.y--;
        } else if (SGF.Input.isKeyDown(SGF.Input.KEY_DOWN)) {
            this.y++;
        } else if (SGF.Input.isKeyDown(SGF.Input.KEY_LEFT)) {
            this.x--;
        } else if (SGF.Input.isKeyDown(SGF.Input.KEY_RIGHT)) {
            this.x++;
        }
    }
});

var b = new Box();
SGF.Game.current.addComponent(b);
