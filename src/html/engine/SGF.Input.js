/** section: Core API
 * SGF.Input
 *
 * Contains information and utility methods concerning player input for games.
 * This covers mouse movement, mouse clicks, and key presses.
 **/
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
        return this;
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
        window.focus();

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
        window.focus();

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
        /**
         * SGF.Input.MOUSE_PRIMARY -> ?
         *
         * Indicates that the primary mouse button has been clicked. This is
         * usually the left mouse button for right-handed people, and the right
         * mouse button for left-handed people.
         **/
        MOUSE_PRIMARY:   0,
        /**
         * SGF.Input.MOUSE_MIDDLE -> ?
         *
         * Indicates that the middle button on the mouse has been clicked. Note
         * that not all mice have a middle button, so if you are planning on
         * using this functionality, it would be a good idea to make to action
         * be performed some other way as well (like a keystroke).
         **/
        MOUSE_MIDDLE:    1,
        /**
         * SGF.Input.MOUSE_SECONDARY -> ?
         *
         * Indicates that the secondary mouse button has been clicked. This is
         * usually the right mouse button for right-handed people, and the left
         * mouse button for left-handed people.
         **/
        MOUSE_SECONDARY: 2,
        /**
         * SGF.Input.KEY_DOWN -> ?
         *
         * Indicates that the `down` arrow or button is being pressed on the keypad.
         **/
        KEY_DOWN:        Event.KEY_DOWN,
        /**
         * SGF.Input.KEY_UP -> ?
         *
         * Indicates that the `up` arrow or button is being pressed on the keypad.
         **/
        KEY_UP:          Event.KEY_UP,
        /**
         * SGF.Input.KEY_LEFT -> ?
         *
         * Indicates that the `left` arrow or button is being pressed on the keypad.
         **/
        KEY_LEFT:        Event.KEY_LEFT,
        /**
         * SGF.Input.KEY_RIGHT -> ?
         *
         * Indicates that the `right` arrow or button is being pressed on the keypad.
         **/
        KEY_RIGHT:       Event.KEY_RIGHT,
        /**
         * SGF.Input.KEY_1 -> ?
         *
         * Indicates that first button on the keypad is being pressed. The "first
         * button" can be configurable to say a client with a keyboard, but if
         * a controller is being used, this should also be the value returned.
         **/
        KEY_1:           32,
        
        // Public "Game" Methods
        observe: observe,
        stopObserving: stopObserving,
        isKeyDown: isKeyDown,

        // Public "Game" Properties
        /**
         * SGF.Input.pointerX -> Number
         *
         * The current X coordinate of the mouse pointer.
         **/
        pointerX: 0,
        /**
         * SGF.Input.pointerX -> Number
         *
         * The current Y coordinate of the mouse pointer.
         **/
        pointerY: 0,

        // Web/Internal Methods
        grabbed: false,
        grab: grab,
        release: release
    };
})();
