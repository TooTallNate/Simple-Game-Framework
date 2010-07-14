/** section: Resources API
 * class Font
 * 99% of games use some sort of text in the game. Whether to display a score
 * or dialog from a character, rendering text on the game screen begins with
 * an [[Font]] instance, to specify which font will be used with the text.
 **/

 /**
  * new Font(game, path)
  * - path (String): The path and filename of the Font to load. This
  *                        can be either a path relative to your game root,
  *                        an absolute path, or an entire data URI of an
  *                        encoded TTF font file. Alternatively, the name
  *                        of a locally installed font can be used.
  *
  * To create an instance of a [[Label]], you must first have an
  * [[Font]] instance that contains the information regarding which
  * font face should be used in the label.
  *
  * An [[Font]] instance can contain the path to a TrueType font file,
  * or contain the name of a locally installed font on the client computer.
  **/

function Font(game, path, onLoad) {

    var self = this;
    
    EventEmitter.call(self);

    if (game instanceof Game) {
        // We're trying to load a font living inside the game folder.
        path = game['root'] + path;
        self['__fontName'] = "SGF_font"+(Math.random() * 10000).round();
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
