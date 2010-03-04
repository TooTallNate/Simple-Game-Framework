/** section: Core API
 * class SGF.Font
 * 99% of games use some sort of text in the game. Whether to display a score
 * or dialog from a character, rendering text on the game screen begins with
 * an [[SGF.Font]] instance, to specify the font that will be used with the text.
 **/
SGF.Font = Class.create({
    /**
     * new SGF.Font(pathOrData)
     * - pathOrData (String): The path and filename of the Font to load. This
     *                        can be either a path relative to your game root,
     *                        an absolute path, or an entire data URI of an
     *                        encoded TTF font file. Alternatively, the name
     *                        of a locally installed font can be used.
     *
     * To create an instance of a [[SGF.Label]], you must first have an
     * [[SGF.Font]] instance that contains the information regarding which
     * font face should be used in the label.
     *
     * An [[SGF.Font]] instance can contain the path to a TrueType font file,
     * or contain the name of a locally installed font on the client computer.
     **/
    initialize: function(pathOrData) {
        if (!Object.isString(pathOrData)) throw "SGF.Font constructor expects a path, data URI, or font name.";

        this.__fontName = "SGF_font"+(Math.random() * 10000).round();
        if (pathOrData.startsWith("data:")) { // An entire Data URI for a font has been embedded.
            this.__styleNode = SGF.Font.embedCss(
                '@font-face {'+
                '  font-family: "' + this.__fontName + '";'+
                '  src: url("'+pathOrData+'");'+
                '}'
            );
        } else if (pathOrData.endsWith(".ttf")) { // A font path was specified
            this.__styleNode = SGF.Font.embedCss(
                '@font-face {'+
                '  font-family: "' + this.__fontName + '";'+
                '  src: url("' + (pathOrData.startsWith("http:") || pathOrData.startsWith("https:") ? "" : SGF.Game.current.root) + pathOrData + '");'+
                '}'
            );
        } else { // Just a regular local font name was specified
            this.__fontName = pathOrData;
        }
    }
});

SGF.Font.embedCss = function(cssString) {
    var node = new Element('style', {"type": "text/css"});
    if (node.styleSheet) {  // IE
        node.styleSheet.cssText = cssString;
    } else {                // the world
        node.appendChild(document.createTextNode(cssString));
    }
    document.getElementsByTagName('head')[0].appendChild(node);
    return node;
};
