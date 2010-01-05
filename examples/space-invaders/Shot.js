SI.Shot = Class.create(SGF.Sprite, {
    initialize: function($super, options) {
        $super(SI.Shot.sharedSpriteset, Object.extend({
            dy: -10
        }, options));
        this.used = false;
    },
    update: function($super) {
        if (SI.gameOver) return;

        if (this.bottom() < 0) {
            this.destroy();
        }

        $super();
    },
    render: function($super, interpolation) {
        if (SI.gameOver) return;
        $super(interpolation);
    },
    destroy: function() {
        SI.game.removeComponent(this);
    }
});

SI.Shot.sharedSpriteset = new SGF.Spriteset("shot.gif", 7, 19);