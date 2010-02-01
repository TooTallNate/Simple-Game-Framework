/**
 * Sprite Follow Mouse Demo
 * ------------------------
 * This simple script makes a "game" that displays a custom mouse cursor,
 * instead of the OS native cursor. The "cursor" is a regular SGF.Sprite
 * subclass, for simplicity.
 *
 * As you move or click the mouse (an example of firing Input events), a
 * random sized, fading away, rotating square, is created. This creates a cool
 * "particle" effect to show off the engine a little bit.
 */


// Set the background color.
SGF.Screen.color = "123456";

// Hide the native mouse cursor. This is for custom game mouse cursors
// or games that don't use the mouse at all, and want it hidden.
// Note that all mouse movement and button events are still fired.
SGF.Screen.useNativeCursor(false);

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

            // Appear above the Rect's
            zIndex: 2
        });
        
        // Attach various input events to this "cursor" instance
        this.bindedCreateRect = this.createRect.bind(this);
        SGF.Input.observe("mousedown", this.bindedCreateRect)
                 .observe("mousemove", this.bindedCreateRect);
    },
    update: function() {
        // Update the Sprite's location to the location of the native cursor
        this.x = SGF.Input.pointerX;
        this.y = SGF.Input.pointerY;
    },
    createRect: function() {
        // Every time 'mousedown', or 'mousemove' is fired, create a new Rect
        new SpriteFollow.Rect({
            x: this.x,
            y: this.y
        });
    }
});

// A Rectangle that gets created when the user clicks a mouse key. It just falls
// down off the screen, and fades away as it falls. An instance is removed from
// the game loop when it becomes completely invisible.
SpriteFollow.Rect = Class.create(SGF.Rectangle, {
    initialize: function($super, options) {
        
        // We'll make it be a square, with a random w/h between 2 and 20.
        var size = ((Math.random()*18)+2);

        $super(Object.extend({
            // Make it move across the screen at a random speed (between -10 and 10)
            dy: (Math.random()*20) - 10,
            dx: (Math.random()*20) - 10,

            width: size,
            height: size,

            // Appear below the CursorClass
            zIndex: 1,
            
            // Generate some random color
            color: (Math.random()*255).round().toColorPart() +
                   (Math.random()*255).round().toColorPart() +
                   (Math.random()*255).round().toColorPart()
        }, options));

        // Add this new instance to the game loop.
        SGF.Game.current.addComponent(this);
    },
    update: function($super) {
        $super();
        this.opacity -= .01;
        this.rotation += .1;
        if (this.opacity <= 0) {
            this.remove();
        }
    },
    remove: function() {
        SGF.Game.current.removeComponent(this);
    }
});

// Make a new instance of our CursorClass class, for use in our game.
SpriteFollow.cursor = new SpriteFollow.CursorClass();

// Add the 'cursor' as a top-level component to the game.
SGF.Game.current.addComponent(SpriteFollow.cursor);
