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
        /**
         * SGF.Spriteset#spriteWidth -> Number
         *
         * Read-only. The width of each sprite on this [[SGF.Spriteset]]. This
         * is the value that was set in the constructor.
         **/
        this.spriteWidth = spriteWidth;
        /**
         * SGF.Spriteset#spriteHeight -> Number
         *
         * Read-only. The height of each sprite on this [[SGF.Spriteset]]. This
         * is the value that was set in the constructor.
         **/
        this.spriteHeight = spriteHeight;
        /**
         * SGF.Spriteset#width -> Number
         *
         * Read-only. The total width of this [[SGF.Spriteset]]. The value of this
         * property is `-1` before it has loaded completely
         * (i.e. [[SGF.Spriteset#loaded]] == false).
         **/
        /**
         * SGF.Spriteset#height -> Number
         *
         * Read-only. The total height of this [[SGF.Spriteset]]. The value of this
         * property is `-1` before it has loaded completely
         * (i.e. [[SGF.Spriteset#loaded]] == false).
         **/
        this.width = this.height = -1; // Not loaded yet.
        /**
         * SGF.Spriteset#loaded -> Boolean
         *
         * `false` immediately after instantiation, `true` once the Image file
         * has been completely loaded into memory.
         **/
        this.loaded = false;

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
        return this.image.cloneNode(true);
    }
});
