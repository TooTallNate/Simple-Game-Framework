SGF.Screen = (function() {
    var REQUIRED_OVERFLOW = "hidden",
        scale = 1,
        lastColor = null;
    
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

    function useNativeCursor(cursor) {
        var val = null;
        if (Boolean(cursor) == false) {
            val = "none";
        }
        if (Object.isString(cursor)) {
            cursor = cursor.toLowerCase();
            if ("default" == (cursor)) {
                val = "default";
            } else if ("crosshair" == (cursor)) {
                val = "crosshair";
            } else if ("hand" == (cursor)) {
                val = "pointer";
            } else if ("move" == (cursor)) {
                val = "move";
            } else if ("text" == (cursor)) {
                val = "text";
            } else if ("wait" == (cursor)) {
                val = "wait";
            } else if ("none" ==(cursor)) {
                val = "none";
            }
        }

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

    function remeasure() {
        //console.log("remeasuring screen");
        SGF.Screen.width = getGameWidth();
        SGF.Screen.height = getGameHeight();
    }

    function resetColor() {
        if (SGF.Screen.color != lastColor) {
            //console.log("Screen color changed!");
            SGF.Screen.element.style.backgroundColor = "#" + SGF.Screen.color;
            lastColor = SGF.Screen.color;
        }
    }

    return {
        element:  null,
        width:    0,
        height:   0,
        bind:     bind,
        getScale: getScale,
        setScale: setScale,
        remeasure: remeasure,
        resetColor: resetColor,
        //getWidth: getGameWidth,
        //getHeight: getGameHeight,
        useNativeCursor: useNativeCursor
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