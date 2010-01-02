SGF.Input = (function() {
    var listeners = {
        "mousemove": [],
        "mousedown": [],
        "mouseup"  : [],

        "keydown"  : [],
        "keyup"    : []
    }

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
                .observe("keypress", stopEvent)
                .observe("keyup", keyupHandler);

        SGF.Screen.element
            .observe("mousemove", mousemoveHandler)
            .observe("mousedown", mousedownHandler)
            .observe("mouseup", mouseupHandler)
            .observe("contextmenu", stopEvent);

        SGF.Input.grabbed = true;
    }

    function release() {
        document.stopObserving("keydown", keydownHandler)
                .stopObserving("keypress", stopEvent)
                .stopObserving("keyup", keyupHandler);

        SGF.Screen.element
            .stopObserving("mousemove", mousemoveHandler)
            .stopObserving("mousedown", mousedownHandler)
            .stopObserving("mouseup", mouseupHandler)
            .stopObserving("contextmenu", stopEvent);
        
        SGF.Input.grabbed = false;
    }

    function stopEvent(event) {
        event.stop();
    }

    function keydownHandler(event) {
        event.stop();
        //console.log(event);
    }

    function keyupHandler(event) {
        event.stop();
        //console.log(event);
    }

    function mousedownHandler(event) {
        event.stop();

        var l = listeners.mousedown,
            i = 0,
            eventObj = getPointerCoords(event);
        eventObj.button = event.button;

        SGF.Input.pointerX = eventObj.x;
        SGF.Input.pointerY = eventObj.y;

        for (; i < l.length; i++) {
            l[i](Object.clone(eventObj));
        }

        //console.log(eventObj);
    }

    function mouseupHandler(event) {
        event.stop();

        var l = listeners.mouseup,
            i = 0,
            eventObj = getPointerCoords(event);
        eventObj.button = event.button;

        SGF.Input.pointerX = eventObj.x;
        SGF.Input.pointerY = eventObj.y;

        for (; i < l.length; i++) {
            l[i](Object.clone(eventObj));
        }

        //console.log(eventObj);
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

    return {
        // Constants
        MOUSE_PRIMARY:   0,
        MOUSE_MIDDLE:    1,
        MOUSE_SECONDARY: 2,
        KEY_DOWN:        63498,
        
        // Public "Game" Methods
        observe: observe,
        stopObserving: stopObserving,

        // Public "Game" Properties
        pointerX: 0,
        pointerY: 0,

        // Web/Internal Methods
        grabbed: false,
        grab: grab,
        release: release
    };
})();
