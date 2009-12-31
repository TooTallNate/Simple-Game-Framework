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
        SGF.Screen.element
            .observe("mousemove", mousemoveHandler);

        SGF.Input.grabbed = true;
    }

    function release() {
        SGF.Screen.element
            .stopObserving("mousemove", mousemoveHandler);
        
        SGF.Input.grabbed = false;
    }

    function mousemoveHandler(event) {
        event.stop();
        
        var l = listeners.mousemove,
            i = 0,
            offset = SGF.Screen.element.cumulativeOffset(),
            currentScale = SGF.Screen.getScale(),
            eventObj = {
                x: (event.pointerX() - offset.left) / currentScale,
                y: (event.pointerY() - offset.top) / currentScale
            };
            
        SGF.Input.pointerX = eventObj.x;
        SGF.Input.pointerY = eventObj.y;
        for (; i < l.length; i++) {
            l[i](Object.clone(eventObj));
        }
    }

    return {
        observe: observe,
        stopObserving: stopObserving,
        grabbed: false,
        grab: grab,
        release: release,

        pointerX: 0,
        pointerY: 0
    };
})();