/** section: Components API
 * class SGF.Spriteset
 *
 * Not technically a game Component, but is required for instantiating [[SGF.Sprite]]s.
 * This class is responsible for loading and keeping a reference to the in-memory Image
 * data for a Spriteset.
 **/
SGF.Spriteset = Class.create({
    /**
     * new SGF.Spriteset(imgPath, spriteWidth, spriteHeight)
     * - imgPath (String): The relative path and filename of the Image to load.
     * - spriteWidth (Number): The width in pixels of each sprite on the spriteset.
     *                         If you are loading a single sprite, this should be
     *                         the width of the image itself.
     * - spriteHeight (Number): The height in pixels of each sprite on the spriteset.
     *                          If you are loading a single sprite, this should be
     *                          the height of the image itself.
     *
     * To create an instance of a [[SGF.Spriteset]], you must first know the
     * relative path of the image file in your game folder, and you must know
     * the width and height of each sprite in pixels on this [[SGF.Spriteset]].
     *
     * Once instantiated, there are no instance methods to call, you just need
     * to pass the reference to this [[SGF.Spriteset]] to new [[SGF.Sprite]]s.
     **/
    initialize: function(imgPath, spriteWidth, spriteHeight) {
        this.loaded = false;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.width = this.height = -1; // Not loaded yet.

        this.loadListeners = [];

        this.image = new Image();
        this.image.onload = this.imageLoaded.bind(this);
        this.image.src = SGF.Game.current.root + imgPath;
        this.image.style.position = "absolute";
    },
    imageLoaded: function(loadEvent) {
        this.width = this.image.width;
        this.height = this.image.height;
        this.loaded = true;
        for (var i=0; i < this.loadListeners.length; i++) {
            this.loadListeners[i](this);
        }
    },
    observe: function(eventName, handler) {
        this.loadListeners.push(handler);
    },
    toElement: function() {
        return this.image.clone(false);
    }
});
