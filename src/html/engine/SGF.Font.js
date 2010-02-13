/** section: Core API
 * class SGF.Font
 * 99% of games use some sort of text in the game. Whether to display a score
 * or dialog from a character, rendering text on the game screen begins with
 * an [[SGF.Font]] instance, to specify the font that will be used with the text.
 **/
SGF.Font = Class.create({
    initialize: function(pathOrData) {
        if (!Object.isString(pathOrData)) throw "SGF.Font constructor expects a path or Data URI of a font file.";

        this.__fontName = "SGF_font"+(Math.random() * 10000).tofi;
        if (pathOrData.startsWith("data:font")) { // An entire Data URI for a font has been embedded.
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
                '  src: url("' + SGF.Game.current.root + pathOrData + '");'+
                '}'
            );
        } else { // Just a regular local font name was specified
            this.__fontName = pathOrData;
        }
    }
});

SGF.Font.embedCss = function(cssString) {
    var node = new Element('style', {"type": "text/css"});
    if (node.styleSheet) {   // IE
        node.styleSheet.cssText = cssString;
    } else {                // the world
        node.appendChild(document.createTextNode(cssString));
    }
    document.getElementsByTagName('head')[0].appendChild(node);
    return node;
};
