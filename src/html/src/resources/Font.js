/** section: Resources API
 * class Font
 * 99% of games use some sort of text in the game. Whether to display a score
 * or dialog from a character, rendering text on the game screen begins with
 * an [[Font]] instance, to specify which font will be used with the text.
 *
 * [[Font]] is an [[EventEmitter]], which emits the following events:
 *
 *  - `load`: Fired when the font resource has completed it's loading process,
 *  either successfully or with an error (i.e. file not found). If
 *  an error occured, a native `Error` will be the first argument
 *  passed to any load listeners.
 **/


 /**
  * new Font(path[, options = null, callback = null])
  * - path (String): The relative or absolute path to a font resource. The
  *                  path should omit the file extension, and supply a `formats`
  *                  property in the `options` argument.
  * - options (Object): Optional. An object containing the instance properties
  *                     that need to be changed from the default. With [[Font]],
  *                     a `formats` Array options will most likely be specified
  *                     to inform the engine which different file types are
  *                     available for use.
  * - callback (Function): Optional. The function to invoke when the `load`
  *                        event is emitted.
  *
  * 
  **/
function Font(game, path, onLoad) {

    var self = this;
    
    EventEmitter.call(self);

    if (game instanceof Game) {
        // We're trying to load a font living inside the game folder.
        path = game['root'] + path;
        self['__fontName'] = "SGF_font"+Math.round(Math.random() * 10000);
        self['__styleNode'] = embedCss(
            '@font-face {'+
            '  font-family: "' + self['__fontName'] + '";'+
            '  src: url("'+path+'");'+
            '}'
        );
    } else {
        // Just a font name supplied, ex: "Comic Sans MS"
        // Must be installed on local computer
        path = game;
        self['__fontName'] = path;
    }
}

function embedCss(cssString) {
    var node = document.createElement("style");
    node['type'] = "text/css";
    if (node['styleSheet']) {  // IE
        node['styleSheet']['cssText'] = cssString;
    } else {                // the world
        node.appendChild(document.createTextNode(cssString));
    }
    document.getElementsByTagName('head')[0].appendChild(node);
    return node;
};

inherits(Font, EventEmitter);
makePrototypeClassCompatible(Font);

Font.prototype['toString'] = functionReturnString("[object Font]");

modules['font'] = Font;
