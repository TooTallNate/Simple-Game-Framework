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
    downMouseButtons = {},
    screenFocused = false;

    /**
     * SGF.Input.observe(eventName, handler) -> SGF.Input
     * - eventName (String): The name of the input event to observe. See below.
     * - handler (Function): The function to execute when `eventName` occurs.
     *
     * Sets the engine to call Function `handler` when input event `eventName`
     * occurs from the user. Allowed `eventName` values are:
     *
     *  - `keydown`: Called when a key is pressed down. The term "key" is meant
     *               to be used loosley, as in, a game client that contains a
     *               keyboard should call this for each key pressed. If the client
     *               contains is a portable gaming device, this should be called
     *               for each button pressed on the controller. The `SGF.Input.KEY_*`
     *               values should be used as the "basic" keyCode values.
     *               Optionally, the `keyCode` property in the argument object
     *               can be used to determine more precisely which key was pressed.
     *
     *  - `keyup`: Called when a key is released. See `keydown` above for more
     *             details.
     *
     *  - `mousemove`: Called continually as the mouse moves across the game screen.
     *                 The `x` and `y` properties in the argument object can be
     *                 used to determine the mouse position.
     *
     *  - `mousedown`: Called when any of the mouse keys are pressed down. The
     *                 `button` value in the argument object can be used to
     *                 determine which mouse button was pressed, along with `x`
     *                 and `y` to determine where on the screen the button was
     *                 pressed down.
     *
     *  - `mouseup`: Called when any of the mouse keys are released. The
     *               `button` value in the argument object can be used to
     *               determine which mouse button was pressed, along with `x`
     *               and `y` to determine where on the screen the button was
     *               pressed released.
     *                 
     **/
    function observe(eventName, handler) {
        if (!(eventName in listeners))
            throw "SGF.Input.observe: '" + eventName + "' is not a recognized event name."
        if (typeof(handler) !== 'function') throw "'handler' must be a Function."
        listeners[eventName].push(handler);
        return this;
    }

    /**
     * SGF.Input.stopObserving(eventName, handler) -> SGF.Input
     * - eventName (String): The name of the input event to stop observing.
     * - handler (Function): The function to remove from execution.
     *
     * Detaches Function `handler` from event `eventName`. See the description
     * and list of events in [[SGF.Input.observe]] for more information on the
     * allowed `eventName` values.
     **/
    function stopObserving(eventName, handler) {
        if (!(eventName in listeners))
            throw "SGF.Input.stopObserving: '" + eventName + "' is not a recognized event name."
        if (typeof(handler) !== 'function') throw "'handler' must be a Function."
        var index = listeners[eventName].indexOf(handler);
        if (index > -1)
            listeners[eventName].remove(index);
        return this;
    }

    /**
     * SGF.Input.isKeyDown(keyCode) -> Boolean
     * - keyCode (Number): The keyCode the check if it is being pressed.
     *
     * Returns `true` if the key `keyCode` is currently being pressed down, or
     * `false` otherwise. `keyCode` can be any of the `SGF.Input.KEY_*` values,
     * or any other key code value for a input device with more keys (like a
     * full keyboard).
     **/
    function isKeyDown(keyCode) {
        return downKeys[keyCode] === true;
    }

    function grab() {
        document.observe("keydown", keydownHandler)
                .observe("keypress", keypressHandler)
                .observe("keyup", keyupHandler)
                .observe("mousemove", mousemoveHandler)
                .observe("mousedown", mousedownHandler)
                .observe("mouseup", mouseupHandler)
                .observe("contextmenu", contextmenuHandler);

        SGF.Input.grabbed = true;
    }

    function release() {
        document.stopObserving("keydown", keydownHandler)
                .stopObserving("keypress", keypressHandler)
                .stopObserving("keyup", keyupHandler)
                .stopObserving("mousemove", mousemoveHandler)
                .stopObserving("mousedown", mousedownHandler)
                .stopObserving("mouseup", mouseupHandler)
                .stopObserving("contextmenu", contextmenuHandler);
        
        SGF.Input.grabbed = false;
    }

    function contextmenuHandler(event) {
        var eventObj = getPointerCoords(event);
        if (screenFocused && eventObj.x >= 0 && eventObj.y >= 0 && eventObj.x <= SGF.Screen.getGameWidth() && eventObj.y <= SGF.Screen.getGameHeight()) {
            event.stop();
        }
    }

    function keypressHandler(event) {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        if (screenFocused) {
            event.stop();
        }
    }

    function keydownHandler(event) {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        if (screenFocused) {
            event.stop();
            if (downKeys[event.keyCode] === true) return;
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
    }

    function keyupHandler(event) {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        if (screenFocused) {
            event.stop();
            if (downKeys[event.keyCode] === false) return;
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
    }

    function mousedownHandler(event) {
        var l = listeners.mousedown,
            i = 0,
            eventObj = getPointerCoords(event);
        eventObj.button = event.button;
        if (eventObj.x >= 0 && eventObj.y >= 0 && eventObj.x <= SGF.Screen.getGameWidth() && eventObj.y <= SGF.Screen.getGameHeight()) {
            focus();
            event.stop();
            window.focus();

            downMouseButtons[event.button] = true;

            SGF.Input.pointerX = eventObj.x;
            SGF.Input.pointerY = eventObj.y;

            for (; i < l.length; i++) {
                l[i](Object.clone(eventObj));
            }
        } else {
            blur();
        }
    }

    function mouseupHandler(event) {
        var l = listeners.mouseup,
            i = 0,
            eventObj = getPointerCoords(event);
        eventObj.button = event.button;
        if (eventObj.x >= 0 && eventObj.y >= 0 && eventObj.x <= SGF.Screen.getGameWidth() && eventObj.y <= SGF.Screen.getGameHeight()) {
            focus();
            event.stop();
            window.focus();

            downMouseButtons[event.button] = false;

            SGF.Input.pointerX = eventObj.x;
            SGF.Input.pointerY = eventObj.y;

            for (; i < l.length; i++) {
                l[i](Object.clone(eventObj));
            }
        }
    }

    function mousemoveHandler(event) {
        var l = listeners.mousemove,
            i = 0,
            eventObj = getPointerCoords(event);
        if (eventObj.x >= 0 && eventObj.y >= 0 &&
            eventObj.x <= SGF.Screen.getGameWidth() &&
            eventObj.y <= SGF.Screen.getGameHeight() &&
            (SGF.Input.pointerX !== eventObj.x || SGF.Input.pointerY !== eventObj.y)) {
            focus();
            event.stop();

            SGF.Input.pointerX = eventObj.x;
            SGF.Input.pointerY = eventObj.y;

            for (; i < l.length; i++) {
                l[i](Object.clone(eventObj));
            }
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

    function blur() {
        screenFocused = false;
    }

    function focus() {
        screenFocused = true;
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
        /**
         * SGF.Input.KEY_2 -> ?
         *
         * Indicates that second button on the keypad is being pressed.
         **/
        KEY_2:           33,
        /**
         * SGF.Input.KEY_3 -> ?
         *
         * Indicates that third button on the keypad is being pressed.
         **/
        KEY_3:           34,
        /**
         * SGF.Input.KEY_4 -> ?
         *
         * Indicates that fourth button on the keypad is being pressed.
         **/
        KEY_4:           35,
        
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
        release: release,
        focus: focus,
        blur: blur
    };
})();
