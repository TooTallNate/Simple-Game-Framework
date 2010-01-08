/** section: Components API
 * class SGF.Sprite < SGF.Component
 *
 * Probably the most used Class in SGF to develop your games. Represents a single
 * sprite state on a spriteset as a [[SGF.Component]]. The state of the sprite
 * can be changed at any time.
 **/
SGF.Sprite = Class.create(SGF.Component, {
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
     *         update: function($super, updateCount) {
     *             // Some cool game logic here...
     *             $super(updateCount);
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
        $super(Object.extend(Object.clone(SGF.Sprite.DEFAULTS), options || {}));
    },
    getElement: function() {
        return new Element("div").setStyle({
            position: "absolute",
            overflow: "hidden"
        }).insert(this.spritesetImg);
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
        if (this.__width != this.width) {
            if (this.spriteset.loaded) {
                this.resetSpriteset();
            } else {
                this.spriteset.observe("load", this.resetSpriteset.bind(this));
            }
        }
        $super(interpolation, renderCount);
    },
    resetSpriteset: function() {
        var scale = SGF.Screen.getScale();
        this.spritesetImg.style.width = ((this.spriteset.width * (this.width/this.spriteset.spriteWidth)) * scale) + "px";
        this.spritesetImg.style.height = ((this.spriteset.height * (this.height/this.spriteset.spriteHeight)) * scale) + "px";
        //this.spritesetImg.style.top = -((this.height * this.spriteY) * scale) + "px";
        //this.spritesetImg.style.top = -((this.height * this.spriteY) * scale) + "px";
    }
});

/**
 * SGF.Sprite.DEFAULTS -> Object
 *
 * The default values used when creating [[SGF.Sprite]]s. These values, as well
 * as the values from [[SGF.Component.DEFAULTS]] are copied onto the [[SGF.Sprite]],
 * if they are not found in the **options** argument.
 *
 * The [[SGF.Sprite.DEFAULTS]] object contains the default values:
 * 
 *     - spriteX: 0
 *     - spriteY: 0
 **/
SGF.Sprite.DEFAULTS = {
    /**
     * SGF.Sprite#spriteX -> Number
     *
     * The X coordinate of the sprite to use from the spriteset. The units are
     * whole [[SGF.Sprite]] widths. So to use the 3rd sprite across on the spriteset,
     * set this value to 3.
     **/
    spriteX: 0,
    /**
     * SGF.Sprite#spriteY -> Number
     *
     * The Y coordinate of the sprite to use from the spriteset. The units are
     * whole [[SGF.Sprite]] heights. So to use the 4th sprite down on the spriteset,
     * set this value to 4.
     **/
    spriteY: 0
};
