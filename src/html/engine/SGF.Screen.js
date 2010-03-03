/** section: Core API
 * SGF.Screen
 *
 * Contains information about the screen the game is being rendered to.
 **/
SGF.Screen = (function() {
    var REQUIRED_OVERFLOW = "hidden",
        scale = 1,
        lastColor = null
        isFullScreen = false;
    
    function bind(element) {
        // First, we need to "normalize" the Screen element by first removing
        // all previous elements, and then setting some standard styles
        element.style.padding = 0;
        element.style.overflow = REQUIRED_OVERFLOW;
        Element.makePositioned(element);
        Element.immediateDescendants(element).without($("webSocketContainer")).invoke("remove");

        // If SGF.Screen.bind has been called prevously, then this call will
        // essentially move all game elements to the new Screen element
        var oldScreen = SGF.Screen.element;
        if (oldScreen !== null && Object.isElement(oldScreen)) {
            Element.immediateDescendants(oldScreen).invoke("remove").each(element.insert, element);
        }
        SGF.Screen.element = element;

        if (SGF.Input && SGF.Input.grabbed) {
            SGF.Input.release();
            SGF.Input.grab();
        }

        isFullScreen = element === document.body;
    }

    function getScale() {
        return scale;
    }

    function setScale(newScale) {
        scale = newScale;

        if (SGF.Game.current != null) {
            var c = SGF.Game.current.components, i=0;
            for (; i < c.length; i++) {
                c[i].scale(scale);
            }
        }
    }

    function useNativeCursor(cursor) {
        var val = null;
        if (Boolean(cursor) == false) {
            cursor = "none";
        }
        if (Object.isString(cursor)) {
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
                val = "url(" + SGF.engineRoot + "blank." + (Prototype.Browser.IE ? "cur" : "gif") + "), none";
            }
        }

        SGF.Screen.element.style.cursor = val;
    }

    function getPixelWidth() {
        return isFullScreen && document.documentElement.clientWidth !== 0 ? document.documentElement.clientWidth : SGF.Screen.element.clientWidth;
    }

    function getPixelHeight() {
        return isFullScreen && document.documentElement.clientHeight !== 0 ? document.documentElement.clientHeight : SGF.Screen.element.clientHeight;
    }

    function getGameWidth() {
        return getPixelWidth() / getScale();
    }

    function getGameHeight() {
        return getPixelHeight() / getScale();
    }

    function reset() {
        SGF.Screen.width = getGameWidth();
        SGF.Screen.height = getGameHeight();
        if (SGF.Screen.color != lastColor) {
            SGF.Screen.element.style.backgroundColor = "#" + SGF.Screen.color;
            lastColor = SGF.Screen.color;
        }
    }

    return {
        // SGF API parts
        /**
         * SGF.Screen.useNativeCursor(cursor) -> undefined
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
         *   - `none` or `false`: Invisible mouse cursor. Note that all mouse movement and button click event will still be fired. This is very useful if your game doesn't use the mouse, or if your game uses a custom mouse cursor (possibly via a [[SGF.Sprite]]).
         **/
        useNativeCursor: useNativeCursor,
        /**
         * SGF.Screen.width -> Number
         *
         * The total width available to your game. Use this value for centering
         * (or any kind of positioning) components.
         **/
        width:    0,
        /**
         * SGF.Screen.height -> Number
         *
         * The total height available to your game. Use this value for centering
         * (or any kind of positioning) components.
         **/
        height:   0,

        // HTML/DOM Specific
        element:  null,
        bind: bind,
        getGameWidth: getGameWidth,
        getGameHeight: getGameHeight,
        getScale: getScale,
        setScale: setScale,
        reset: reset
    }
})();

// This inline function checks the SGF.params property for
// any params relating to the Screen (i.e. screen, scale).
(function(screen) {

    // Bind the 'screen' param. document.body by default.
    var screenElement = document.body;
    if ("screen" in SGF.params) {
        screenElement = $(SGF.params.screen);
    }
    screen.bind(screenElement);

    // Set the initial scale, if 'scale' was given
    if ("scale" in SGF.params) {
        screen.setScale(parseFloat(SGF.params.scale));
    }
})(SGF.Screen);
