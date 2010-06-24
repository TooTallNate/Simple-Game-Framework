/** section: Components API
 * class SGF.Sprite < SGF.Component
 *
 * Probably the most used Class in SGF to develop your games. Represents a single
 * sprite state on a spriteset as a [[SGF.Component]]. The state of the sprite
 * can be changed at any time.
 **/
var Sprite = Class.create(Component, {
    /**
     * new SGF.Sprite(spriteset[, options])
     * - spriteset (SGF.Spriteset): The spriteset for this Sprite to use. This is
     *                              final once instantiated, and cannot be changed.
     * - options (Object): The optional 'options' object's properties are copied
     *                     this [[SGF.Sprite]] in the constructor. It allows all
     *                     the same default properties as [[SGF.Component]], but
     *                     also adds [[SGF.Sprite#spriteX]] and [[SGF.Sprite#spriteY]].
     *
     * Instantiates a new [[SGF.Sprite]] based on the given [[SGF.Spriteset]].
     * It's more common, however, to make your own subclass of [[SGF.Sprite]] in
     * your game code. For example:
     *
     *     var AlienClass = Class.create(SGF.Sprite, {
     *         initialize: function($super, options) {
     *             $super(AlienClass.sharedSpriteset, options);
     *         },
     *         update: function($super) {
     *             // Some cool game logic here...
     *             $super();
     *         }
     *     });
     *
     *     AlienClass.sharedSpriteset = new SGF.Spriteset("alien.png", 25, 25);
     *
     * Here we are creating a [[SGF.Sprite]] subclass called **AlienClass** that
     * reuses the same [[SGF.Spriteset]] object for all instances, and centralizes
     * logic code by overriding the [[SGF.Component#update]] method.
     **/
    initialize: function($super, spriteset, options) {
        this.spriteset = spriteset;
        this.spritesetImg = spriteset.toElement();
        $super(Object.extend(Object.clone(Sprite.DEFAULTS), options || {}));
    },
    getElement: function($super) {
        return $super().insert(this.spritesetImg);
    },
    scale: function($super, newScale) {
        $super(newScale);
        
        if (this.spriteset.loaded) {
            this.resetSpriteset();
        } else {
            this.spriteset.observe("load", this.resetSpriteset.bind(this));
        }
    },
    render: function($super, interpolation, renderCount) {
        if (this.__spriteX != this.spriteX || this.__spriteY != this.spriteY ||
            this.__width != this.width || this.__height != this.height) {
            if (this.spriteset.loaded) {
                this.resetSpriteset();
            } else if (!this.__resetOnLoad) {
                this.spriteset.addListener("load", this.resetSpriteset.bind(this));
                this.__resetOnLoad = true;
            }
        }
        $super(interpolation, renderCount);
    },
    resetSpriteset: function() {
        this.spritesetImg.setStyleI("width", (this.spriteset.width * (this.width/this.spriteset.spriteWidth)) + "px");
        this.spritesetImg.setStyleI("height", (this.spriteset.height * (this.height/this.spriteset.spriteHeight)) + "px");
        this.spritesetImg.setStyleI("top", -(this.height * this.spriteY) + "px");
        this.spritesetImg.setStyleI("left", -(this.width * this.spriteX) + "px");
        this.__spriteX = this.spriteX;
        this.__spriteY = this.spriteY;
    }
});

/**
 * SGF.Sprite#spriteX -> Number
 *
 * The X coordinate of the sprite to use from the spriteset. The units are
 * whole [[SGF.Sprite]] widths. So to use the 3rd sprite across on the spriteset,
 * set this value to 3.
 **/
Sprite.prototype['spriteX'] = 0;

/**
 * SGF.Sprite#spriteY -> Number
 *
 * The Y coordinate of the sprite to use from the spriteset. The units are
 * whole [[SGF.Sprite]] heights. So to use the 4th sprite down on the spriteset,
 * set this value to 4.
 **/
Sprite.prototype['spriteY'] = 0;

modules['sprite'] = Sprite;
