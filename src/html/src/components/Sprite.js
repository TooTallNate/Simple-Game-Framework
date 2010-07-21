/** section: Components API
 * class Sprite < Component
 *
 * Probably the most used Class in SGF to develop your games. Represents a single
 * sprite state on a spriteset as a [[Component]]. The state of the sprite
 * can be changed at any time.
 **/


/**
 * new Sprite(spriteset[, options])
 * - spriteset (Spriteset): The spriteset for this Sprite to use. This is
 *                              final once instantiated, and cannot be changed.
 * - options (Object): The optional 'options' object's properties are copied
 *                     this [[Sprite]] in the constructor. It allows all
 *                     the same default properties as [[Component]], but
 *                     also adds [[Sprite#spriteX]] and [[Sprite#spriteY]].
 *
 * Instantiates a new [[Sprite]] based on the given [[Spriteset]].
 * It's more common, however, to make your own subclass of [[Sprite]] in
 * your game code. For example:
 *
 *     var AlienClass = Class.create(Sprite, {
 *         initialize: function($super, options) {
 *             $super(AlienClass.sharedSpriteset, options);
 *         },
 *         update: function($super) {
 *             // Some cool game logic here...
 *             $super();
 *         }
 *     });
 *
 *     AlienClass.sharedSpriteset = new Spriteset("alien.png", 25, 25);
 *
 * Here we are creating a [[Sprite]] subclass called **AlienClass** that
 * reuses the same [[Spriteset]] object for all instances, and centralizes
 * logic code by overriding the [[Component#update]] method.
 **/
function Sprite(spriteset, options) {
    this['spriteset'] = spriteset;
    this['spritesetImg'] = spriteset['image'].cloneNode(false);
    Component.call(this, options);
}

inherits(Sprite, Component);
makePrototypeClassCompatible(Sprite);

Sprite.prototype['getElement'] = function() {
    var element = Component.prototype['getElement'].call(this);
    element.appendChild(this['spritesetImg']);
    return element;
};

Sprite.prototype['render'] = function(renderCount) {
    var self = this;
    if (self['__spriteX'] != self['spriteX'] || self['__spriteY'] != self['spriteY'] ||
        self['__width'] != self['width'] || self['__height'] != self['height']) {
        if (self['spriteset']['loaded']) {
            self['resetSpriteset']();
        } else if (!self['__resetOnLoad']) {
            self['spriteset']['addListener']("load", function() {
                self['resetSpriteset']();
            });
            self['__resetOnLoad'] = true;
        }
    }
    Component.prototype['render'].call(self, renderCount);
};

Sprite.prototype['resetSpriteset'] = function() {
    var self = this, image = self['spritesetImg'];
    setStyleImportant(image, "width", (self['spriteset']['width'] * (self['width']/self['spriteset']['spriteWidth']) / devicePixelRatio) + "px");
    setStyleImportant(image, "height", (self['spriteset']['height'] * (self['height']/self['spriteset']['spriteHeight']) / devicePixelRatio) + "px");
    setStyleImportant(image, "top", -(self['height'] * self['spriteY'] / devicePixelRatio) + "px");
    setStyleImportant(image, "left", -(self['width'] * self['spriteX'] / devicePixelRatio) + "px");
    self['__spriteX'] = self['spriteX'];
    self['__spriteY'] = self['spriteY'];
}

/**
 * Sprite#spriteX -> Number
 *
 * The X coordinate of the sprite to use from the spriteset. The units are
 * whole [[Sprite]] widths. So to use the 3rd sprite across on the spriteset,
 * set this value to 3.
 **/
Sprite.prototype['spriteX'] = 0;

/**
 * Sprite#spriteY -> Number
 *
 * The Y coordinate of the sprite to use from the spriteset. The units are
 * whole [[Sprite]] heights. So to use the 4th sprite down on the spriteset,
 * set this value to 4.
 **/
Sprite.prototype['spriteY'] = 0;

Sprite.prototype['toString'] = functionReturnString("[object Sprite]");

modules['sprite'] = Sprite;
