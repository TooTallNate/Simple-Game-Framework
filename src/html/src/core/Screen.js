var REQUIRED_OVERFLOW = "hidden";

/** section: Core API
 * class Screen
 *
 * Contains information about the screen the game is being rendered to.
 **/
var Screen = function(game) {
    var self = this;
    
    EventEmitter.call(self);
        
    self['_bind'] = function(element) {
        // First, we need to "normalize" the Screen element by first removing
        // all previous elements, and then setting some standard styles
        var style = element['style'];
        style['padding'] = 0;
        style['overflow'] = REQUIRED_OVERFLOW;
        if (style['MozUserSelect'] !== undefined) {
            style['MozUserSelect'] = "moz-none";
        } else if (style['webkitUserSelect'] !== undefined) {
            style['webkitUserSelect'] = "none";
        }
        Element['makePositioned'](element);
        for (var i=0, nodes=element.childNodes, l=nodes.length, node=null; i<l ;i++) {
            node = nodes[i];
            if (node && (node.id != "webSocketContainer")) {
                element.removeChild(node);
            }
        }
        //Element['immediateDescendants'](element)['without']($("webSocketContainer"))['invoke']("remove");

        // If Screen#bind has been called prevously, then this call has to
        // essentially move all game elements to the new Screen element
        if (self['element'] !== null && Object['isElement'](self['element'])) {
            Element['immediateDescendants'](self['element'])['invoke']("remove")['each'](element['insert'], element);
        }
        
        self['element'] = element;
        game['element'] = element;

        self['isFullScreen'] = (element === document.body);
    }

    self['useNativeCursor'] = function(cursor) {
        var val = null;
        if (Boolean(cursor) == false) {
            cursor = "none";
        }
        if (Object['isString'](cursor)) {
            cursor = cursor.toLowerCase();
            if ("default" == cursor) {
                val = "default";
            } else if ("crosshair" == cursor) {
                val = "crosshair";
            } else if ("hand" == cursor) {
                val = "pointer";
            } else if ("move" == cursor) {
                val = "move";
            } else if ("text" == cursor) {
                val = "text";
            } else if ("wait" == cursor) {
                val = "wait";
            } else if ("none" == cursor) {
                val = "url(" + engineRoot + "blank." + (isIE ? "cur" : "gif") + "), none";
            }
        }

        self['element'].style.cursor = val;
    }

    // SGF API parts
    /**
     * Screen#useNativeCursor(cursor) -> undefined
     * - cursor (String | false)
     *
     * Changes the mouse icon to one of the specified `cursor` values.
     * These values correspond to the system native cursors, and those
     * icons will be used.
     *
     * The allowed `cursor` values are:
     *
     *   - `default`: The default system mouse pointer.
     *
     *   - `hand`: A hand that has an index finger pointing to the hot spot.
     *
     *   - `crosshair`: A crosshair symbol, or + sign. Could be useful as a gun shoot point.
     *
     *   - `move`: Makes arrows point in all directions. Maybe if something is draggable in your UI.
     *
     *   - `text`: Makes it look like an element can be typed inside of.
     *
     *   - `wait`: A busy icon. Useful for loading script files or other dependencies.
     *
     *   - `none` or `false`: Invisible mouse cursor. Note that all mouse movement and button click event will still be fired. This is very useful if your game doesn't use the mouse, or if your game uses a custom mouse cursor (possibly via a [[Sprite]]).
     **/
    /**
     * Screen#width -> Number
     *
     * The total width available to your game. Use this value for centering
     * (or any kind of positioning) components.
     **/
    /**
     * Screen#height -> Number
     *
     * The total height available to your game. Use this value for centering
     * (or any kind of positioning) components.
     **/
}

inherits(Screen, EventEmitter);

Screen.prototype['_r'] = function() {
    var self = this, color = self['color'], element = self['element'];
    self['width'] = self['isFullScreen'] && document.documentElement.clientWidth !== 0 ? document.documentElement.clientWidth : self['element'].clientWidth;
    self['height'] = self['isFullScreen'] && document.documentElement.clientHeight !== 0 ? document.documentElement.clientHeight : self['element'].clientHeight;
    if (color != self['_c']) {
        element['style']['backgroundColor'] = "#" + color;
        self['_c'] = color;
    }
}

Screen.prototype['color'] = "000000";

Screen.prototype['isFullScreen'] = false;

Screen.prototype['toString'] = functionReturnString("[object Screen]");

modules['screen'] = Screen;
