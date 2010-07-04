/** section: Components API
 * class SGF.Sprite < SGF.Component
 *
 * Probably the most used Class in SGF to develop your games. Represents a single
 * sprite state on a spriteset as a [[SGF.Component]]. The state of the sprite
 * can be changed at any time.
 **/


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
    setStyleImportant(image, "width", (self['spriteset']['width'] * (self['width']/self['spriteset']['spriteWidth'])) + "px");
    setStyleImportant(image, "height", (self['spriteset']['height'] * (self['height']/self['spriteset']['spriteHeight'])) + "px");
    setStyleImportant(image, "top", -(self['height'] * self['spriteY']) + "px");
    setStyleImportant(image, "left", -(self['width'] * self['spriteX']) + "px");
    self['__spriteX'] = self['spriteX'];
    self['__spriteY'] = self['spriteY'];
}

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

Sprite.prototype['toString'] = functionReturnString("[object Sprite]");

modules['sprite'] = Sprite;
