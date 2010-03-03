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


// Set the background color, in RRGGBB notation.
SGF.Screen.color = "123456";

// Hide the native mouse cursor. This is for custom game mouse cursors
// or games that don't use the mouse at all, and want it hidden.
// Note that all mouse movement and button events are still fired.
SGF.Screen.useNativeCursor(false);

// Firstly, it's always a good idea to namespace your games. This is because
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
        SGF.Input.observe("mousedown",  this.bindedCreateRect)
                 .observe("mouseup",    this.bindedCreateRect)
                 .observe("mousemove",  this.bindedCreateRect)
                 .observe("keydown",    this.bindedCreateRect)
                 .observe("keyup",      this.bindedCreateRect);
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

// A Rectangle that gets created when the user performs various input events.
// The Rectangle starts at the position of the mouse, and moves away at a
// random speed, and rotates at a random rotation.
SpriteFollow.Rect = Class.create(SGF.Rectangle, {
    initialize: function($super, options) {
        
        // We'll make it be a square, with a random w/h between 2 and 20.
        var size = (Math.random()*18) + 2;

        $super(Object.extend({
            width: size,
            height: size,
            
            opacity: .5,

            // Appear below the CursorClass
            zIndex: 1,
            
            // Generate a random color, utilizing Prototype's Number#toColorPart()
            color: (Math.random()*255).round().toColorPart() +
                   (Math.random()*255).round().toColorPart() +
                   (Math.random()*255).round().toColorPart()
        }, options));
        
        // Make it move across the screen at a random speed (between -10 and 10)
        this.dy = (Math.random()*20) - 10;
        this.dx = (Math.random()*20) - 10;

        // Make a random rotation speed between 0° and 40°
        this.rotationSpeed = Math.random() * (Math.PI/180 * 40);

        // Add this new instance to the game loop.
        SGF.Game.current.addComponent(this);
        this.startCount = SGF.Game.current.updateCount;
    },
    update: function(updateCount) {
        // First check if it should be removed because it's lived it's life
        if (updateCount - this.startCount > 50) {
            this.remove();
        } else { // Otherwise update the Rect appropriately.
            this.x += this.dx;
            this.y += this.dy;
            this.opacity -= .01;
            this.rotation += this.rotationSpeed;
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
