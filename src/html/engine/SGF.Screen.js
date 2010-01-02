SGF.Screen = (function() {
    var REQUIRED_OVERFLOW = "hidden",
        scale = 1;
    
    function bind(element) {
        if (element.getStyle("overflow") != REQUIRED_OVERFLOW)
            element.style.overflow = REQUIRED_OVERFLOW;

        element.innerHTML = "";
        element.makePositioned();

        var oldScreen = SGF.Screen.element;
        if (oldScreen !== null && Object.isElement(oldScreen)) {
            oldScreen.immediateDescendants().invoke("remove").each(element.insert, element);
        }
        SGF.Screen.element = element;

        if (SGF.Input && SGF.Input.grabbed) {
            SGF.Input.release();
            SGF.Input.grab();
        }
    }

    function getScale() {
        return scale;
    }

    function setScale(newScale) {
        scale = newScale;

        if (SGF.Game.current instanceof SGF.Game) {
            var c = SGF.Game.current.components, i=0;
            for (; i < c.length; i++) {
                c[i].scale(scale);
            }
        }
    }

    function showNativeCursor(bool) {
        if (typeof(bool) != 'boolean') {
            throw "SGF.Screen.showNativeCursor expects a 'boolean' "+
                  "argument, got '" + typeof(bool) + "'";
        }

        var val = bool === true ? "default" : "none";
        if (SGF.Screen.element.getStyle("cursor") != val)
            SGF.Screen.element.style.cursor = val;
    }

    function getPixelWidth() {
        return SGF.Screen.element.measure("width");
    }

    function getPixelHeight() {
        return SGF.Screen.element.measure("height");
    }

    function getGameWidth() {
        return getPixelWidth() / getScale();
    }

    function getGameHeight() {
        return getPixelHeight() / getScale();
    }

    return {
        element:  null,
        bind:     bind,
        getScale: getScale,
        setScale: setScale,
        getWidth: getGameWidth,
        getHeight: getGameHeight,
        showNativeCursor: showNativeCursor
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