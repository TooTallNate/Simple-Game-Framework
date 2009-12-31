SGF.Screen = (function() {
    var REQUIRED_OVERFLOW = "hidden",
        scale = 1;
    
    function bind(element) {
        if (element.getStyle("overflow") != REQUIRED_OVERFLOW)
            element.style.overflow = REQUIRED_OVERFLOW;

        element.innerHTML = "";
        SGF.Screen.element = element;
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

    return {
        element: null,
        bind: bind,
        getScale: getScale,
        setScale: setScale,
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