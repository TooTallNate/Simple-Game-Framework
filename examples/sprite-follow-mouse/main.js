/**
 * Sprite Follow Mouse Demo
 * ------------------------
 * This simple script makes a "game" that displays a custom mouse cursor,
 * instead of the OS native cursor. The "cursor" is a regular SGF.Sprite
 * subclass, for simplicity.
 */

// Firstly, it's always a good idea to namespace you games. This is because
// we don't like polluting the global namespace, since you could potentially
// overwrite important native objects.
SpriteFollow = {};

// So first we're going to create a Sprite subclass, called CursorClass, that
// automatically instantiates the Spriteset class with our custom cursor image.
// A sub-update() method relocates the cursor to where the pointer is currently.
SpriteFollow.CursorClass = Class.create(SGF.Sprite, {
    initialize: function($super) {
        var spriteset = new SGF.Spriteset("hand_32x32.png", 32, 32);
        $super(spriteset, {
            width: spriteset.spriteWidth,
            height: spriteset.spriteHeight,
            zIndex: 2
        });

        SGF.Input.observe("mousedown", this.createDrop.bind(this));
    },
    update: function() {
        this.x = SGF.Input.pointerX;
        this.y = SGF.Input.pointerY;
    },
    createDrop: function() {
        SGF.Game.current.addComponent(new SpriteFollow.Drop({
            x: this.x,
            y: this.y
        }));
    }
});

// A "drop" that gets created when the user clicks a mouse key. It just falls
// down off the screen, and fades away as it falls. An instance is removed from
// the game loop when it falls below the screen.
SpriteFollow.Drop = Class.create(SGF.Rectangle, {
    initialize: function($super, options) {
        $super(Object.extend({
            //radius:2.5,
            dy:5,
            // Appear below the Cursor
            zIndex: 1,
            // Generate some random color
            color: (Math.random()*255).round().toColorPart() +
                   (Math.random()*255).round().toColorPart() +
                   (Math.random()*255).round().toColorPart()
        }, options));
        this.startY = this.y;
    },
    update: function($super) {
        var screenHeight = SGF.Screen.height;
        this.opacity = (screenHeight - this.y) / (screenHeight - this.startY);
        if (this.top() >= screenHeight) {
            SGF.Game.current.removeComponent(this);
        }
        $super();
    }
});

// Make a new instance of our CursorClass class, for use in our game.
SpriteFollow.cursor = new SpriteFollow.CursorClass();

// Add the 'cursor' as a top-level component to the game.
SGF.Game.current.addComponent(SpriteFollow.cursor);

// Set the background color.
SGF.Screen.color = "123456";

// Hide the native mouse cursor. This is for custom game mouse cursors
// or games that don't use the mouse at all, and want it hidden.
// Note that all mouse movement and button actions are still fired.
SGF.Screen.useNativeCursor(false);
