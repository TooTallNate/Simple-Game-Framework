SGF.Screen = {
    scale: 1,
    element: null,
    
    bind: function(element) {
        if (element.getStyle("overflow") != "hidden")
            element.style.overflow = "hidden";

        SGF.Screen.element = element;
    },

    getScale: function() {
        return SGF.Screen.scale;
    },

    setScale: function(scale) {
        SGF.Screen.scale = scale;
    },

    showNativeCursor: function(bool) {
        if (typeof(bool) != 'boolean') {
            throw "SGF.Screen.showNativeCursor expects a 'boolean' "+
                  "argument, got '" + typeof(bool) + "'";
        }

        var val = bool === true ? "default" : "none";
        if (SGF.Screen.element.getStyle("cursor") != val)
            SGF.Screen.element.style.cursor = val;
    }


};

// This inline function checks the SGF.params property for
// any params relating to the Screen (i.e. screen, scale).
(function(screen) {
    var screenElement = document.body;
    if ("screen" in SGF.params) {
        screenElement = $(SGF.params.screen);
    }
    screen.bind(screenElement);

    var initialScale = 1;
    if ("scale" in SGF.params) {
        initialScale = parseFloat(SGF.params.scale);
    }
    screen.setScale(initialScale);
})(SGF.Screen);