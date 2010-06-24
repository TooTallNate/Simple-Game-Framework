/** section: Components API
 * class Spriteset
 *
 * The `Spriteset` class is responsible for loading and keeping a
 * reference to the in-memory Image data for a Spriteset.
 **/

 /**
  * new Spriteset(game, path, spriteWidth, spriteHeight[, onLoad])
  * - game (Game): The relative path and filename of the Image to load.
  * - path (String): The relative path and filename of the Image to load.
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
function Spriteset(game, path, spriteWidth, spriteHeight, onLoad) {
    var self = this;
    
    EventEmitter.call(self);
    
    self['spriteWidth'] = spriteWidth;
    self['spriteHeight'] = spriteHeight;

    if (onLoad) {
        self['addListener']("load", onLoad);
    }

    var img = new Image();
    img['style']['position'] = "absolute";
    img['onload'] = function() {
        self['width'] = img['width'];
        self['height'] = img['height'];
        self['loaded'] = true;
        self['fireEvent']("load");
    };

    self['image'] = img;

    // Finally begin loading the image itself!
    self['src'] = img['src'] = game['root'] + path;
}
Spriteset['subclasses'] = [];
// so that (spritesetInstance instanceof EventEmitter) === true
Spriteset.prototype = new EventEmitter(true);

/**
 * Spriteset#loaded -> Boolean
 *
 * `false` immediately after instantiation, `true` once the Image file
 * has been completely loaded into memory.
 **/
Spriteset.prototype['loaded'] = false;

/**
 * SGF.Spriteset#width -> Number
 *
 * Read-only. The total width of this [[SGF.Spriteset]]. The value of this
 * property is `-1` before it has loaded completely
 * (i.e. [[SGF.Spriteset#loaded]] == false).
 **/
Spriteset.prototype['width'] = -1;

/**
 * SGF.Spriteset#height -> Number
 *
 * Read-only. The total height of this [[SGF.Spriteset]]. The value of this
 * property is `-1` before it has loaded completely
 * (i.e. [[SGF.Spriteset#loaded]] == false).
 **/
Spriteset.prototype['height'] = -1;

/**
 * SGF.Spriteset#spriteWidth -> Number
 *
 * Read-only. The width of each sprite on this [[SGF.Spriteset]]. This
 * is the value that was set in the constructor.
 **/
Spriteset.prototype['spriteWidth'] = -1;

/**
 * SGF.Spriteset#spriteHeight -> Number
 *
 * Read-only. The height of each sprite on this [[SGF.Spriteset]]. This
 * is the value that was set in the constructor.
 **/
Spriteset.prototype['spriteHeight'] = -1;

/**
 * Spriteset#src -> String
 * 
 * The absolute URL to the image resource.
 **/
Spriteset.prototype['src'] = null;

Spriteset.prototype['toElement'] = function() {
    return this.image.cloneNode(true);
}

Spriteset.prototype['toString'] = function() {
    return "[object Spriteset]";
}

modules['spriteset'] = Spriteset;
