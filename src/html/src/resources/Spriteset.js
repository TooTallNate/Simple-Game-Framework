/** section: Resources API
 * class Spriteset
 *
 * The `Spriteset` class is responsible for loading and keeping a
 * reference to the in-memory Image data for a Spriteset. The actual type of
 * Image resource supported depends on the SGF engine in use. However, `.jpg`
 * `.png`, `.gif` are highly recommended to be implemented in every engine.
 **/

 /**
  * new Spriteset(path, spriteWidth, spriteHeight[, callback = null])
  * - path (String): The absolute or relative path of the Image resource to
  *                  load. A relative path using `new` will be relative to the
  *                  current page. To get a resource relative to your game
  *                  root, use [[Game#getSpriteset]] instead.
  * - spriteWidth (Number): The width in pixels of each sprite on the spriteset.
  *                         If you are loading a single sprite, this should be
  *                         the width of the image itself.
  * - spriteHeight (Number): The height in pixels of each sprite on the spriteset.
  *                          If you are loading a single sprite, this should be
  *                          the height of the image itself.
  * - callback (Function): Optional. A `Function` to invoke when the image
  *                        loading process has completed, successfully or
  *                        not. If an error occured (ex: file not found),
  *                        an `Error` object will be passed as the first
  *                        argument to `callback`.
  *
  * To create an instance of a [[Spriteset]], you must first know the
  * relative path of the image file in your game folder, and you must know
  * the width and height of each sprite in pixels on this [[Spriteset]].
  *
  * Once instantiated, there are no instance methods to call, you just need
  * to pass the [[Spriteset]] reference to new [[Sprite]]s.
  **/
function Spriteset(game, path, spriteWidth, spriteHeight, onLoad) {
    if (game instanceof Game) {
        path = game['root'] + path;
    } else {
        // Absolute URL was given...
        onLoad = spriteHeight;
        spriteHeight = spriteWidth;
        spriteWidth = path;
        path = game;
    }

    var self = this;
    
    EventEmitter.call(self);
    
    self['spriteWidth'] = spriteWidth;
    self['spriteHeight'] = spriteHeight;

    if (onLoad) {
        self['addListener']("load", onLoad);
    }

    var img = new Image;
    img['style']['position'] = "absolute";
    img['onload'] = function() {
        self['width'] = img['width'];
        self['height'] = img['height'];
        self['loaded'] = true;
        self['emit']("load");
    };

    self['image'] = img;

    // Finally begin loading the image itself!
    img['src'] = path;
    self['src'] = img['src'];
}

inherits(Spriteset, EventEmitter);
makePrototypeClassCompatible(Spriteset);


/**
 * Spriteset#loaded -> Boolean
 *
 * Read-only. `false` immediately after instantiation, `true` once the Image
 * file has been completely loaded into memory, just before the `load` event
 * is fired.
 **/
Spriteset.prototype['loaded'] = false;

/**
 * Spriteset#width -> Number
 *
 * Read-only. The total width of this [[Spriteset]]. The value of this
 * property is `NaN` before it has loaded completely
 * (i.e. [[Spriteset#loaded]] == false).
 **/
Spriteset.prototype['width'] = NaN;

/**
 * Spriteset#height -> Number
 *
 * Read-only. The total height of this [[Spriteset]]. The value of this
 * property is `NaN` before it has loaded completely
 * (i.e. [[Spriteset#loaded]] == false).
 **/
Spriteset.prototype['height'] = NaN;

/**
 * Spriteset#spriteWidth -> Number
 *
 * Read-only. The width of each sprite on this [[Spriteset]]. This
 * is the value that was set in the constructor.
 **/
Spriteset.prototype['spriteWidth'] = NaN;

/**
 * Spriteset#spriteHeight -> Number
 *
 * Read-only. The height of each sprite on this [[Spriteset]]. This
 * is the value that was set in the constructor.
 **/
Spriteset.prototype['spriteHeight'] = NaN;

/**
 * Spriteset#src -> String
 * 
 * Read-only. The absolute URL to the image resource.
 **/
Spriteset.prototype['src'] = null;

Spriteset.prototype['toString'] = functionReturnString("[object Spriteset]");

modules['spriteset'] = Spriteset;
