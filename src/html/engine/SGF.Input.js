SGF.Input = (function() {
    var listeners = {
        "mousemove": [],
        "mousedown": [],
        "mouseup"  : [],

        "keydown"  : [],
        "keyup"    : []
    },
    downKeys = {},
    downMouseButtons = {};

    function observe(eventName, handler) {
        if (!eventName in listeners)
            throw "SGF.Input.observe: '" + eventName + "' is not a recognized event name."

        listeners[eventName].push(handler);
    }

    function stopObserving(eventName, handler) {
        if (!eventName in listeners)
            throw "SGF.Input.stopObserving: '" + eventName + "' is not a recognized event name."

        listeners[eventName] = listeners[eventName].without(handler);
    }

    function grab() {
        document.observe("keydown", keydownHandler)
                .observe("keypress", keypressHandler)
                .observe("keyup", keyupHandler);

        SGF.Screen.element
            .observe("mousemove", mousemoveHandler)
            .observe("mousedown", mousedownHandler)
            .observe("mouseup", mouseupHandler)
            .observe("contextmenu", contextmenuHandler);

        SGF.Input.grabbed = true;
    }

    function release() {
        document.stopObserving("keydown", keydownHandler)
                .stopObserving("keypress", keypressHandler)
                .stopObserving("keyup", keyupHandler);

        SGF.Screen.element
            .stopObserving("mousemove", mousemoveHandler)
            .stopObserving("mousedown", mousedownHandler)
            .stopObserving("mouseup", mouseupHandler)
            .stopObserving("contextmenu", contextmenuHandler);
        
        SGF.Input.grabbed = false;
    }

    function contextmenuHandler(event) {
        event.stop();
    }

    function keypressHandler(event) {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        event.stop();
    }

    function keydownHandler(event) {
        if (event.ctrlKey || event.metaKey || event.altKey) return;

        event.stop();
        var l = listeners.keydown,
            i = 0,
            eventObj = {
                keyCode: event.keyCode,
                shiftKey: event.shiftKey
            };
        
        downKeys[event.keyCode] = true;

        for (; i < l.length; i++) {
            l[i](Object.clone(eventObj));
        }
    }

    function keyupHandler(event) {
        if (event.ctrlKey || event.metaKey || event.altKey) return;

        event.stop();
        var l = listeners.keyup,
            i = 0,
            eventObj = {
                keyCode: event.keyCode,
                shiftKey: event.shiftKey
            };

        downKeys[event.keyCode] = false;

        for (; i < l.length; i++) {
            l[i](Object.clone(eventObj));
        }
    }

    function mousedownHandler(event) {
        event.stop();

        var l = listeners.mousedown,
            i = 0,
            eventObj = getPointerCoords(event);
        eventObj.button = event.button;
        
        downMouseButtons[event.button] = true;

        SGF.Input.pointerX = eventObj.x;
        SGF.Input.pointerY = eventObj.y;

        for (; i < l.length; i++) {
            l[i](Object.clone(eventObj));
        }
    }

    function mouseupHandler(event) {
        event.stop();

        var l = listeners.mouseup,
            i = 0,
            eventObj = getPointerCoords(event);
        eventObj.button = event.button;
        
        downMouseButtons[event.button] = false;

        SGF.Input.pointerX = eventObj.x;
        SGF.Input.pointerY = eventObj.y;

        for (; i < l.length; i++) {
            l[i](Object.clone(eventObj));
        }
    }

    function mousemoveHandler(event) {
        event.stop();
        
        var l = listeners.mousemove,
            i = 0,
            eventObj = getPointerCoords(event);
            
        SGF.Input.pointerX = eventObj.x;
        SGF.Input.pointerY = eventObj.y;
        
        for (; i < l.length; i++) {
            l[i](Object.clone(eventObj));
        }
    }

    function getPointerCoords(event) {
        var offset = SGF.Screen.element.cumulativeOffset(),
            currentScale = SGF.Screen.getScale();
        return {
            x: (event.pointerX() - offset.left) / currentScale,
            y: (event.pointerY() - offset.top) / currentScale
        };
    }

    function isKeyDown(keyCode) {
        return downKeys[keyCode] === true;
    }

    return {
        // Constants
        MOUSE_PRIMARY:   0,
        MOUSE_MIDDLE:    1,
        MOUSE_SECONDARY: 2,
        KEY_DOWN:        Event.KEY_DOWN,
        KEY_UP:          Event.KEY_UP,
        KEY_LEFT:        Event.KEY_LEFT,
        KEY_RIGHT:       Event.KEY_RIGHT,
        KEY_1:           32,
        
        // Public "Game" Methods
        observe: observe,
        stopObserving: stopObserving,
        isKeyDown: isKeyDown,

        // Public "Game" Properties
        pointerX: 0,
        pointerY: 0,

        // Web/Internal Methods
        grabbed: false,
        grab: grab,
        release: release
    };
})();
