SI.Alien = Class.create(SGF.Sprite, {
    initialize: function($super, options) {
        this.alive = true;
        $super(SI.Alien.sharedSpriteset, options);
        this.dx = SI.Alien.moveSpeed;
        SI.Alien.instances.push(this);
    },
    update: function($super) {
        if (!SI.gameOver) {
            if (this.right() >= SGF.Screen.width) {
                SI.Alien.setMoveSpeed(-3);
                SI.Alien.moveDown();
            } else if (this.left() <= 0) {
                SI.Alien.setMoveSpeed(3);
                SI.Alien.moveDown();
            }
            if (this.bottom() >= SGF.Screen.height) {
                SI.endGame();
            }
        }
        $super();
    },
    render: function($super, interpolation) {
        $super(interpolation);
    },
    die: function() {
        this.alive = false;
        SI.Alien.instances = SI.Alien.instances.without(this);
        SI.game.removeComponent(this);
    }
});

Object.extend(SI.Alien, {
    sharedSpriteset: new SGF.Spriteset("alien.gif", 40, 25),
    moveSpeed: 3,
    instances: [],
    mapInstances: function(func) {
        return SI.Alien.instances.map(func);
    },
    setMoveSpeed: function(speed) {
        SI.Alien.mapInstances(function(alien) {
            alien.dx = speed;
        });
    },
    moveDown: function() {
        SI.Alien.mapInstances(function(alien) {
            alien.y += 10;
        });
    }
});