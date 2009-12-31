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
    initialize: function($super, options) {
        $super(
            new SGF.Spriteset("hand_32x32.png", 32, 32),
            options
        );
    },
    update: function($super) {
        this.x = SGF.Input.pointerX;
        this.y = SGF.Input.pointerY;
        $super();
    }
});

// Make a new instance of our CursorClass class, for use in our game.
SpriteFollow.cursor = new SpriteFollow.CursorClass();

// Add the 'cursor' as a top-level component to the game.
SGF.Game.current.addComponent(SpriteFollow.cursor);

// Clean up what we've added to the global namespace when the game is stopping.
// This is not mandatory, but good for tidiness sake.
SGF.Game.current.observe("stopping", function() {
    delete window.SpriteFollow;
});

// Hide the native mouse cursor. This is for custom game mouse cursors
// or games that don't use the mouse at all, and want it hidden.
// Note that all mouse movement and button actions are still fired.
SGF.Screen.showNativeCursor(false);