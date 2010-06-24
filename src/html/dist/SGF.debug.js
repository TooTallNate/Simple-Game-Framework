(function(window, document) {

    // The absolute URL of the SGF file currently executing. Used
    // to get the <script> reference for parameter parsing, and to
    // get the relative path of library files.
    var scriptName = null
    // The <script> node reference of this script. It can have parameters
    // in order to override some default initialization options.
    ,   scriptNode = null
    // The absolute path to the folder where this script file lives.
    // Needed to determine the relative locations of library files.
    ,   engineRoot = null
    // The parsed user options retrieved from the <script> node. These
    // can include. Defining any of these on the node is optional:
    //
    //     prototype - the path to the Prototype (>=v1.6.1) library. You
    //          could use the value:
    //              http://ajax.googleapis.com/ajax/libs/prototype/1.6.1.0/prototype.js
    //          for example to load Prototype from Google Ajax Lib servers.
    //          Default: "lib/prototype.js" relative to this script file.
    //
    //     swfobject - the path to SWFObject (>=v2.2) You could use:
    //              http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js
    //          for example to load Prototype from Google Ajax Lib servers.
    //          Default: "lib/swfobject.js" relative to this script file.
    //
    //     fabridge - the path to Adobe's FABridge.js file.
    //          Default: "lib/FABridge.js" relative to this script file.
    //
    // You can convieniently invoke 'SGF.startWithDiv' after SGF has loaded
    // with a 'screen' & 'game' combination:
    //
    //     game - the path to the SGF game to launch.
    //
    //     screen - the 'id' of the <div> to use as the screen. If omitted
    //          but a 'game' value is still supplied, then
    //          'SGF.startFullScreen' gets invoked instead.
    //
    ,   params = {
        'prototype':    'lib/prototype.js',
        'swfobject':    'lib/swfobject.js',
        'fabridge':     'lib/fabridge.js',
        'soundjs':      'lib/sound.min.js',
        'soundjs-swf':  'lib/sound.swf',
        'websocket':    'lib/web_socket.js',
        'websocket-swf':'lib/WebSocketMain.swf'
    },
    loadStartTime = new Date(),
    // "Modules" are the classes retrieved from calling SGF.require().
    modules = {};

    /* EventEmitter is an internal class that a lot of main SGF classes inherit 
 * from. The class implements the common listener pattern used throughout SGF.
 */
function EventEmitter(inheriting) {
    if (!inheriting) { // Needed for: 'class.prototype = new EventEmitter(true)'
        var self = this;
        self['_l'] = {};
    
        // In order to get EventEmitter functionality on a Class that already
        // extends another Class, invoke `EventEmitter.call(this)` in the
        // constructor without the call to `Class.prototype = new EventEmitter(true)`.
        // This is needed for Game, which directly extends Container, but also
        // needs EventEmitter functionality.
        if (!(self instanceof EventEmitter)) {
            for (var i in EventEmitter.prototype) {
                self[i] = EventEmitter.prototype[i];
            }
        }
    }
}

EventEmitter.prototype['addListener'] = function(eventName, func) {
    var listeners = this['_l'];
    if (!(eventName in listeners)) {
        listeners[eventName] = [];
    }
    listeners[eventName]['push'](func);
    return this;
}

EventEmitter.prototype['removeListener'] = function(eventName, func) {
    var listeners = this['_l'][eventName];
    if (listeners) {
        var index = listeners['indexOf'](func);
        if (index >= 0) {
            arrayRemove(listeners, index);
        }
    }
    return this;
}

EventEmitter.prototype['removeAllListeners'] = function(eventName) {
    delete this['_l'][eventName];
    return this;
}

EventEmitter.prototype['fireEvent'] = function(eventName, args) {
    var listeners = this['_l'][eventName], i=0;
    if (listeners) {
        for (var l=listeners.length; i<l; i++) {
            listeners[i].apply(this, args);
        }
    }
    return this;
}

// Deprecated
var observeMessage = false;
EventEmitter.prototype['observe'] = function() {
    if (!observeMessage) {
        log("DEPRECATED: 'EventEmitter#observe' is deprecated, "+
            "please use 'EventEmitter#addListener' instead.")
        observeMessage = true;
    }
    return this['addListener']['apply'](this, arguments);
};

var stopObservingMessage = false;
EventEmitter.prototype['stopObserving'] = function() {
    if (!stopObservingMessage) {
        log("DEPRECATED: 'EventEmitter#stopObserving' is deprecated, "+
            "please use 'EventEmitter#removeListener' instead.")
        stopObservingMessage = true;
    }
    return this['removeListener']['apply'](this, arguments);
    
}

modules['eventemitter'] = EventEmitter;

var REQUIRED_OVERFLOW = "hidden";

/** section: Core API
 * SGF.Screen
 *
 * Contains information about the screen the game is being rendered to.
 **/
Screen = function(game) {
    var self = this;
    
    EventEmitter.call(self);
        
    self['_bind'] = function(element) {
        // First, we need to "normalize" the Screen element by first removing
        // all previous elements, and then setting some standard styles
        var style = element['style'], input = game['input'];
        style['padding'] = 0;
        style['overflow'] = REQUIRED_OVERFLOW;
        if (style['MozUserSelect'] !== undefined) {
            style['MozUserSelect'] = "moz-none";
        } else if (style['webkitUserSelect'] !== undefined) {
            style['webkitUserSelect'] = "none";
        }
        Element.makePositioned(element);
        Element.immediateDescendants(element).without($("webSocketContainer")).invoke("remove");

        // If SGF.Screen#bind has been called prevously, then this call has to
        // essentially move all game elements to the new Screen element
        if (this['element'] !== null && Object.isElement(this['element'])) {
            Element.immediateDescendants(this['element']).invoke("remove").each(element['insert'], element);
        }
        
        this['element'] = element;

        this['isFullScreen'] = (element === document.body);
    }

    self['useNativeCursor'] = function(cursor) {
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
                val = "url(" + engineRoot + "blank." + (Prototype.Browser.IE ? "cur" : "gif") + "), none";
            }
        }

        this['element'].style.cursor = val;
    }

    // SGF API parts
    /**
     * Screen#useNativeCursor(cursor) -> undefined
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
    /**
     * Screen#width -> Number
     *
     * The total width available to your game. Use this value for centering
     * (or any kind of positioning) components.
     **/
    /**
     * Screen#height -> Number
     *
     * The total height available to your game. Use this value for centering
     * (or any kind of positioning) components.
     **/
}

Screen['subclasses'] = [];

// so that (screenInstance instanceof EventEmitter) === true
Screen.prototype = new EventEmitter(true);

Screen.prototype['_r'] = function() {
    var self = this; color = self['color'], element = self['element'];
    self['width'] = self['isFullScreen'] && document.documentElement.clientWidth !== 0 ? document.documentElement.clientWidth : self['element'].clientWidth;
    self['height'] = self['isFullScreen'] && document.documentElement.clientHeight !== 0 ? document.documentElement.clientHeight : self['element'].clientHeight;
    if (color != self['_c']) {
        element.style.backgroundColor = "#" + color;
        self['_c'] = color;
    }
}

Screen.prototype['color'] = "000000";

Screen.prototype['isFullScreen'] = false;

Screen.prototype['toString'] = function() {
    return "[object Screen]";
}

modules['screen'] = Screen;

var currentInput = null;

/** section: Core API
 * Input
 *
 * Contains information and utility methods concerning player input for games.
 * This covers mouse movement, mouse clicks, and key presses.
 **/
function Input(game) {
    
    
    var downKeys = {},
    downMouseButtons = {},
    self = this;

    EventEmitter.call(self);

    self['game'] = game;
    self['_k'] = {};
    

    /**
     * Input.observe(eventName, handler) -> SGF.Input
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
     /*
    function observe(eventName, handler) {
        if (!(eventName in listeners))
            throw "SGF.Input.observe: '" + eventName + "' is not a recognized event name."
        if (typeof(handler) !== 'function') throw "'handler' must be a Function."
        listeners[eventName].push(handler);
        return this;
    }
    */

    /**
     * SGF.Input.stopObserving(eventName, handler) -> SGF.Input
     * - eventName (String): The name of the input event to stop observing.
     * - handler (Function): The function to remove from execution.
     *
     * Detaches Function `handler` from event `eventName`. See the description
     * and list of events in [[SGF.Input.observe]] for more information on the
     * allowed `eventName` values.
     **/
    /*
    function stopObserving(eventName, handler) {
        if (!(eventName in listeners))
            throw "SGF.Input.stopObserving: '" + eventName + "' is not a recognized event name."
        if (typeof(handler) !== 'function') throw "'handler' must be a Function."
        var index = listeners[eventName].indexOf(handler);
        if (index > -1)
            arrayRemove(listeners[eventName], index);
        return this;
    }
    */




        
        // Public "Game" Methods
        //observe: observe,
        //stopObserving: stopObserving,
        //isKeyDown: isKeyDown,

        // Public "Game" Properties
        /**
         * SGF.Input.pointerX -> Number
         *
         * The current X coordinate of the mouse pointer.
         **/
        /**
         * SGF.Input.pointerX -> Number
         *
         * The current Y coordinate of the mouse pointer.
         **/
}

// so that (inputInstance instanceof EventEmitter) === true
Input.prototype = new EventEmitter(true);

Input.prototype['pointerX'] = 0;
Input.prototype['pointerY'] = 0;
/**
 * Input#isKeyDown(keyCode) -> Boolean
 * - keyCode (Number): The keyCode to check if it is being pressed.
 *
 * Returns `true` if the key `keyCode` is currently being pressed down, or
 * `false` otherwise. `keyCode` can be any of the `SGF.Input.KEY_*` values,
 * or any other key code value for a input device with more keys (like a
 * full keyboard).
 **/
Input.prototype['isKeyDown'] = function(keyCode) {
    return this['_k'][keyCode] === true;
}

Input.prototype['toString'] = function() {
    return "[object Input]";
}

// Constants
/**
 * SGF.Input.MOUSE_PRIMARY -> ?
 *
 * Indicates that the primary mouse button has been clicked. This is
 * usually the left mouse button for right-handed people, and the right
 * mouse button for left-handed people.
 **/
Input.MOUSE_PRIMARY = 0;
/**
 * SGF.Input.MOUSE_MIDDLE -> ?
 *
 * Indicates that the middle button on the mouse has been clicked. Note
 * that not all mice have a middle button, so if you are planning on
 * using this functionality, it would be a good idea to make to action
 * be performed some other way as well (like a keystroke).
 **/
Input.MOUSE_MIDDLE = 1;
/**
 * SGF.Input.MOUSE_SECONDARY -> ?
 *
 * Indicates that the secondary mouse button has been clicked. This is
 * usually the right mouse button for right-handed people, and the left
 * mouse button for left-handed people.
 **/
Input.MOUSE_SECONDARY = 2;
/**
 * SGF.Input.KEY_DOWN -> ?
 *
 * Indicates that the `down` arrow or button is being pressed on the keypad.
 **/
Input.KEY_DOWN = 40;
/**
 * SGF.Input.KEY_UP -> ?
 *
 * Indicates that the `up` arrow or button is being pressed on the keypad.
 **/
Input.KEY_UP = 38;
/**
 * SGF.Input.KEY_LEFT -> ?
 *
 * Indicates that the `left` arrow or button is being pressed on the keypad.
 **/
Input.KEY_LEFT = 37;
/**
 * SGF.Input.KEY_RIGHT -> ?
 *
 * Indicates that the `right` arrow or button is being pressed on the keypad.
 **/
Input.KEY_RIGHT = 39;
/**
 * SGF.Input.KEY_1 -> ?
 *
 * Indicates that first button on the keypad is being pressed. The "first
 * button" can be configurable to say a client with a keyboard, but if
 * a controller is being used, this should also be the value returned.
 **/
Input.KEY_1 = 32;
/**
 * SGF.Input.KEY_2 -> ?
 *
 * Indicates that second button on the keypad is being pressed.
 **/
Input.KEY_2 = 33;
/**
 * SGF.Input.KEY_3 -> ?
 *
 * Indicates that third button on the keypad is being pressed.
 **/
Input.KEY_3 = 34;
/**
 * SGF.Input.KEY_4 -> ?
 *
 * Indicates that fourth button on the keypad is being pressed.
 **/
Input.KEY_4 = 35;

function blur() {
    currentInput = null;
}

function focus(input) {
    currentInput = input;
}

function getPointerCoords(event) {
    var offset = currentInput['game']['screen']['element'].cumulativeOffset();
    return {
        'x': (event.pointerX() - offset['left']),
        'y': (event.pointerY() - offset['top'])
    };
}


function contextmenuHandler(event) {
    if (currentInput) {
        var eventObj = getPointerCoords(event), currentScreen = currentInput['game']['screen'];
        if (eventObj.x >= 0 && eventObj.y >= 0 &&
            eventObj.x <= currentScreen.width &&
            eventObj.y <= currentScreen.height) {
            event.stop();
        }
    }
}

function keypressHandler(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (currentInput) {
        event.stop();
    }
}

function keydownHandler(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (currentInput) {
        event.stop();
        if (currentInput['_k'][event.keyCode] === true) return;
        var eventObj = {
                'keyCode': event.keyCode,
                'shiftKey': event.shiftKey
            };

        currentInput['_k'][event.keyCode] = true;

        currentInput['fireEvent']("keydown", [eventObj]);
    }
}

function keyupHandler(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (currentInput) {
        event.stop();
        if (currentInput['_k'][event.keyCode] === false) return;
        var eventObj = {
                keyCode: event.keyCode,
                shiftKey: event.shiftKey
            };

        currentInput['_k'][event.keyCode] = false;

        currentInput['fireEvent']("keydown", [eventObj]);
    }
}

function mousedownHandler(event) {
    if (currentInput) {
        var eventObj = getPointerCoords(event), currentScreen = currentInput['game']['screen'];
        eventObj['button'] = event['button'];
        if (eventObj.x >= 0 && eventObj.y >= 0 &&
            eventObj.x <= currentScreen.width &&
            eventObj.y <= currentScreen.height) {
            
            focus(currentInput);
            event.stop();
            window.focus();

            //downMouseButtons[event.button] = true;

            currentInput['pointerX'] = eventObj.x;
            currentInput['pointerY'] = eventObj.y;

            currentInput['fireEvent']("mousedown", [eventObj]);
        } else {
            blur();
            mousedownHandler(event);
        }
    } else {
        var i = runningGameInstances.length
        ,   offset = null
        ,   element = null
        ,   pointerX = event.pointerX()
        ,   pointerY = event.pointerY();
        while (i--) {
            element = runningGameInstances[i]['screen']['element'];
            offset = element.cumulativeOffset();
            
            if (pointerX >= (offset['left'])
             && pointerX <= (offset['left'] + element['clientWidth'])
             && pointerY >= (offset['top'])
             && pointerY <= (offset['top'] + element['clientHeight'])) {
                 
                currentInput = runningGameInstances[i]['input'];
                mousedownHandler(event);
            }
        }
    }
}

function mouseupHandler(event) {
    if (currentInput) {
        var eventObj = getPointerCoords(event), currentScreen = currentInput['game']['screen'];
        eventObj['button'] = event['button'];
        if (eventObj.x >= 0 && eventObj.y >= 0 &&
            eventObj.x <= currentScreen.width &&
            eventObj.y <= currentScreen.height) {

            event.stop();

            //downMouseButtons[event.button] = false;

            currentInput['pointerX'] = eventObj.x;
            currentInput['pointerY'] = eventObj.y;
            
            currentInput['fireEvent']("mouseup", [eventObj]);
        }
    }
}

function mousemoveHandler(event) {
    if (currentInput) {
        var eventObj = getPointerCoords(event), currentScreen = currentInput['game']['screen'];
        if (eventObj.x >= 0 && eventObj.y >= 0 &&
            eventObj.x <= currentScreen.width &&
            eventObj.y <= currentScreen.height &&
            (currentInput['pointerX'] !== eventObj['x'] || currentInput['pointerY'] !== eventObj['y'])) {

            event.stop();

            currentInput['pointerX'] = eventObj.x;
            currentInput['pointerY'] = eventObj.y;
            
            currentInput['fireEvent']("mousemove", [eventObj]);
        }
    }
}

Input['subclasses'] = [];

Input['grab'] = function() {
    document.observe("keydown", keydownHandler)
            .observe("keypress", keypressHandler)
            .observe("keyup", keyupHandler)
            .observe("mousemove", mousemoveHandler)
            .observe("mousedown", mousedownHandler)
            .observe("mouseup", mouseupHandler)
            .observe("contextmenu", contextmenuHandler);
    Input.grabbed = true;
}

Input['release'] = function() {
    document.stopObserving("keydown", keydownHandler)
            .stopObserving("keypress", keypressHandler)
            .stopObserving("keyup", keyupHandler)
            .stopObserving("mousemove", mousemoveHandler)
            .stopObserving("mousedown", mousedownHandler)
            .stopObserving("mouseup", mouseupHandler)
            .stopObserving("contextmenu", contextmenuHandler);
    Input.grabbed = false;
}

modules['input'] = Input;
var now = (function() {
        if ("now" in Date) {
            return Date['now'];
        } else {
            return function() {
                return (new Date).getTime();
            };
        }
    })(),
    currentGame = null,
    runningGameInstances = [];

/** section: Core API
 * class Game
 *
 * Represents your game itself. That is, there's one instance of [[SGF.Game]] at
 * a time, but every game is it's own instance, and creation of this object is
 * automatic and behind the scenes. Most importantly, this class is in
 * charge of the "game loop". The methods you (as a game developer) will
 * probably be interested in are [[SGF.Game#addComponent]],
 * [[SGF.Game#removeComponent]], and [[SGF.Game#loadScript]]. But there are some
 * more advances features for the adventurous.
 **/
 
/**
 * SGF.Game#updateCount -> Number
 *
 * The total number of times that [[SGF.Game#update]] has been called
 * throughout the lifetime of the game.
 **/
 
/**
 * SGF.Game#renderCount -> Number
 *
 * The total number of times that [[SGF.Game#render]] has been called
 * throughout the lifetime of the game.
 **/
function Game(rootUrl, screen, options) {

    var self = this;
    
    /**
     * SGF.Game#addComponent(component) -> SGF.Game
     * - component (SGF.Component): The top-level component to add to the game
     *                              loop and begin rendering.
     *                              
     * Adds a [[SGF.Component]] to the game. It will be rendered onto the screen,
     * and considered in the game loop. Returns the [[SGF.Game]] object (this),
     * for chaining.
     **/
    self['addComponent'] = function(component) {
        var currentParent = component['parent'];
        if (currentParent !== self) {
            if (currentParent)
                currentParent['removeComponent'](component);
            components.push(component);
            self['screen'].element.insert(component);
            component['parent'] = self;
            component['__fixZIndex']();
        }
        return self;
    }

    /**
     * SGF.Game#removeComponent(component) -> SGF.Game
     * - component (SGF.Component): The top-level component to remove from the
     *                              game loop and stop rendering.
     *                              
     * Removes a [[SGF.Component]] that has previously been added to the game
     * loop via [[SGF.Game#addComponent]].
     **/
    self['removeComponent'] = function(component) {
        var index = components.indexOf(component);
        if (index > -1) {
            arrayRemove(components, index);
            component.toElement().remove();
            component['parent'] = null;
        }
        return self;
    }


    /**
     * SGF.Game#loadScript(filePath[, onLoad = null]) -> SGF.Game
     * - filePath (String): The relative path, including filename of the game
     *                      script file to load.
     * - onLoad (Function): Optional. The `Function` to invoke when the script
     *                      file has finished loading and executing.
     *                      
     * Loads a script file from the game's folder into the game environment. The
     * script is immediately executed once it has finished loading. Afterwards,
     * the optional `onLoad` function is called.
     **/
     /*
    self['loadScript'] = function(relativeUrl, onComplete) {
        loadScript(self['root'] + relativeUrl,
            Object.isFunction(onComplete) ? onComplete.bind(self) : emptyFunction);
        return self;
    }
    */

    /**
     * SGF.Game#observe(eventName, handler) -> SGF.Game
     * - eventName (String): The name of the game event to attach a handler to.
     * - handler (Function): A reference to the `Function` that should be
     *                       executed when `eventName` occurs.
     *
     * Attaches `handler` to one of the allowed `eventName`s. When `eventName`
     * occurs in the execition environment, `handler` will be executed. Multiple
     * handlers are allowed to be attached to a single event (via subsequent calls
     * to `observe`) and they will  be executed in the order they were observed
     * when the event occurs.
     **/
     /*
    self['observe'] = function(eventName, handler) {
        if (!(eventName in listeners))
            throw "SGF.Game#observe: '" + eventName + "' is not a recognized event name.";
        if (typeof(handler) !== 'function') throw "'handler' must be a Function."
        listeners[eventName].push(handler);
        return self;
    }
    */

    /**
     * SGF.Game#render(interpolation) -> undefined
     * - interpolation (Number): The percentage (value between 0.0 and 1.0)
     *                           between the last call to update and the next
     *                           call to update this call to render is taking place.
     *                           This number is used to "predict" locations of
     *                           Components when the FPS are higher than UPS.
     *                           
     * The game render function that gets called automatically during each pass
     * in the game loop. Calls [[SGF.Component#render]] on all components added
     * through [[SGF.Game#addComponent]]. Afterwards, increments the
     * [[SGF.Game#renderCount]] value by 1. Game code should never have to call
     * this method, however.
     **/
    self['render'] = function() {
        for (var i=0; i<components.length; i++) {
            if (components[i]['render'])
                components[i]['render'](self['renderCount']);
        }
        self['renderCount']++;
    }


    /*
     * The main iterator function. Called as fast as the browser can handle
     * (i.e. setTimeout(this.step, 0)) in order to implement variable FPS.
     * This method, however, ensures that update() is called at the requested
     * "gameSpeed", so long as hardware is capable.
     **/
    self['step'] = function() {
        // Stop the loop if the 'running' flag is changed.
        if (!self.running) return self.stopped();

        currentGame = self;

        // This while loop calls update() as many times as required depending
        // on the current time and the last time update() was called. This
        // could happen 0 times if the hardware is calling step() more times
        // than the requested 'gameSpeed'. This will result in higher FPS than UPS
        var loops = 0;
        while (now() > self.nextGamePeriod && loops < self.maxFrameSkips) {
            self.update();
            self.nextGamePeriod += self.period;
            loops++;
        }

        // Sets the screen background color, screen width and height
        self.screen['_r']();

        // Renders all game components, taking the interpolation value
        // to predict where the game objects will be placed.
        //this.render((this.now() + this.period - this.nextGamePeriod) / this.period);
        self.render(0);

        // Continue the game loop, as soon as the browser has time for it,
        // allowing for other JS on the stack to be executed (events, etc.)
        setTimeout(self['_s'], 0);
        //setTimeout("SGF.Game.current.step()", 0); <- Appears to be the same speed
    }

    /*
     * Stops the game loop if the game is running.
     **/
    self['stop'] = function() {
        self.fireEvent("stopping");
        self.running = false;
        return self;
    }

    self['stopped'] = function() {
        //if (SGF.Input.grabbed) SGF.Input.release();
        self['screen']['useNativeCursor'](true);
        currentGame = null;
        self['fireEvent']("stopped");
    }

    /**
     * SGF.Game#update() -> undefined
     * The update function for the game loop. Calls [[SGF.Component#update]]
     * on all components added through [[SGF.Game#addComponent]]. Afterwards,
     * increments the [[SGF.Game#updateCount]] value by 1. Game code should
     * never have to call this method, however.
     **/
    self['update'] = function() {
        for (var i=0; i<components.length; i++) {
            if (components[i]['update'])
                components[i]['update'](self['updateCount']);
        }
        self['updateCount']++;
    }

    /* HTML/DOM Client specific function
     * Computes the z-index of a component added through addComponent.
     **/
    self['__computeChildZIndex'] = function(zIndex) {
        return ((parseInt(zIndex)||0)+1) * 1000;
    }




    EventEmitter.call(self);
    
    self['input'] = new Input(self);
    self['screen'] = new Screen(self);
    self['screen']['_bind'](screen);




    //log("new Game: " + rootUrl);
    
    var components = [];
    /*,
        listeners = {
            "load":     [],
            "start":    [],
            "stopping": [],
            "stopped":  []
        };*/

    // 'root' is the path to the folder containing the Game's 'main.js' file.
    if (rootUrl.endsWith("main.js")) rootUrl = rootUrl.substring(0, rootUrl.lastIndexOf("main.js"));
    self['root'] = rootUrl.endsWith('/') ? rootUrl : rootUrl + '/';
    
    // Override the default options with the user defined options
    if (options) {
        Object.extend(self, options);
    }

    // Set the initial game speed. This can be changed during gameplay.
    self['setGameSpeed'](self['gameSpeed']);

    // Init some standard properties
    self['loaded'] = self['running'] = false;
    self['startTime'] = NaN;

    // Set as currentGame for Game.getInstance
    currentGame = self;

    self['_s'] = function() {
        self['step']();
    }

    // Last step of initialization is to load the Game's 'main.js' file
    new Script(self, "main.js", function() {
        self['loaded'] = true;
        // Notify all the game's 'load' listeners
        self['fireEvent']('load');
        if (self['autostart'] === true) {
            self['start']();
        }
    });
}

/**
 * Game#setGameSpeed(updatesPerSecond) -> Game
 * - updatesPerSecond (Number): The number of updates per second to set this
 *                              game.
 *                              
 * Sets the "Game Speed", or attempted times [[SGF.Game#update]] gets called
 * per second. This can be changed at any point during gameplay. Note that
 * playing sounds and music speed do not get affected by changing this value.
 **/
Game.prototype['setGameSpeed'] = function(updatesPerSecond) {
    this['gameSpeed'] = updatesPerSecond;

    // 'period' is the attempted time between each update() call (in ms).
    this['period'] = 1000 / updatesPerSecond;
    return this;
}

Game.prototype['start'] = function() {
    //log("Starting " + this.root);

    //Input.focus();

    // The 'running' flag is used by step() to determine if the loop should
    // continue or end. No not set directly, use stop() to kill game loop.
    this.running = true;

    runningGameInstances.push(this);

    // Note when the game started, and when the next
    // call to update() should take place.
    this.startTime = this.nextGamePeriod = now();
    this.updateCount = this.renderCount = 0;

    // Start the game loop itself!
    setTimeout(this['_s'], 0);

    // Notify game's 'start' listeners
    this['fireEvent']("start");
}

Game.prototype['getFont'] = function(relativeUrl, onLoad) {
    return new modules['font'](this, relativeUrl, onLoad);
}

Game.prototype['getScript'] = function(relativeUrl, onLoad) {
    return new modules['script'](this, relativeUrl, onLoad);
}

Game.prototype['getSound'] = function(relativeUrl, onLoad) {
    return new modules['sound'](this, relativeUrl, onLoad);
}

Game.prototype['getSpriteset'] = function(relativeUrl, width, height, onLoad) {
    return new modules['spriteset'](this, relativeUrl, width, height, onLoad);
}

/**
 * If true, start the game loop immediately after 'main.js' loads.
 */
Game.prototype['autostart'] = true;
/**
 * The current target updates per seconds to achieve. This is meant
 * to be read-only. If you must dynamically change the game speed,
 * use [[Game#setGameSpeed]] instead.
 */
Game.prototype['gameSpeed'] = 30;
/**
 * The maximum allowed number of updates to call in between render calls
 * if the game's demand is more than current harware is capable of.
 */
Game.prototype['maxFrameSkips'] = 5;
/**
 * Game#toString -> String
 *
 * String representation of the `Game` class.
 **/
Game.prototype['toString'] = function() {
    return "[object Game]";
}

Game['subclasses'] = [];

/**
 * Game.getInstance() -> Game
 *
 * Gets the `Game` instance for your game.
 **/
Game['getInstance'] = function() {
    return currentGame;
}

modules['game'] = Game;


    /** section: Resources API
 * class Font
 * 99% of games use some sort of text in the game. Whether to display a score
 * or dialog from a character, rendering text on the game screen begins with
 * an [[Font]] instance, to specify which font will be used with the text.
 **/

 /**
  * new Font(game, path)
  * - path (String): The path and filename of the Font to load. This
  *                        can be either a path relative to your game root,
  *                        an absolute path, or an entire data URI of an
  *                        encoded TTF font file. Alternatively, the name
  *                        of a locally installed font can be used.
  *
  * To create an instance of a [[SGF.Label]], you must first have an
  * [[SGF.Font]] instance that contains the information regarding which
  * font face should be used in the label.
  *
  * An [[SGF.Font]] instance can contain the path to a TrueType font file,
  * or contain the name of a locally installed font on the client computer.
  **/

function Font(game, path, onLoad) {

    var self = this;
    
    EventEmitter.call(self);

    if (game instanceof Game) {
        // We're trying to load a font living inside the game folder.
        path = game['root'] + path;
        this.__fontName = "SGF_font"+(Math.random() * 10000).round();
        this.__styleNode = embedCss(
            '@font-face {'+
            '  font-family: "' + this.__fontName + '";'+
            '  src: url("'+path+'");'+
            '}'
        );
    } else {
        // Just a font name supplied, ex: "Comic Sans MS"
        // Must be installed on local computer
        path = game;
        this.__fontName = path;
    }
}

function embedCss(cssString) {
    var node = document.createElement("style");
    node['type'] = "text/css";
    if (node['styleSheet']) {  // IE
        node['styleSheet']['cssText'] = cssString;
    } else {                // the world
        node.appendChild(document.createTextNode(cssString));
    }
    document.getElementsByTagName('head')[0].appendChild(node);
    return node;
};
Font['subclasses'] = [];
Font.prototype = new EventEmitter(true);

modules['font'] = Font;

// Dynamically load a script element, calling an optional callback
// function once the script has finished loading.
function Script(game, scriptUrl, onLoad) {
    if (game instanceof Game) {
        scriptUrl = game['root'] + scriptUrl;
    } else {
        // Absolute URL was given...
        onLoad = scriptUrl;
        scriptUrl = game;
    }

    // Create a new script element with the specified src
    var script = document.createElement("script")
    ,   self = this;
    
    EventEmitter.call(self);
    
    script['type'] = "text/javascript";
    script['setAttribute']("async", "true");

    script['onload'] = script['onreadystatechange'] = function() {
        if (!script['readyState'] || script['readyState'] == "loaded" || script['readyState'] == "complete") {
            if (typeof onLoad == "function") {
                onLoad.apply(self, arguments);
            }
        }
    }

    script['src'] = scriptUrl;

    // Add the script element to the document head
    document.getElementsByTagName("head")[0].appendChild(script);

}
Script['subclasses'] = [];
Script.prototype = new EventEmitter(true);
Script.prototype['loaded'] = false;


// Expects a <script> node reference, and removes it from the DOM, and
// destroys the object in a memory leak free manner.
function destroyScript(script) {
    // If it's somewhere in the DOM, remove it!
    if (script.parentNode)
        script.parentNode.removeChild(script);
    // Now remove all properties on the object
    for (var prop in script)
        delete script[prop];
    return script;
}
Script['destroyScript'] = destroyScript;

modules['script'] = Script;

var Sound = function(path) {
    var self = this;

    EventEmitter.call(self);
}
Sound['subclasses'] = [];
// so that (soundInstance instanceof EventEmitter) === true
Sound.prototype = new EventEmitter(true);

modules['sound'] = Sound;

/** section: Components API
 * class Spriteset
 *
 * The `Spriteset` class is responsible for loading and keeping a
 * reference to the in-memory Image data for a Spriteset.
 **/

 /**
  * new Spriteset(game, path, spriteWidth, spriteHeight[, onLoad])
  * - game (Game): The relative path and filename of the Image to load.
  * - path (String): The relative path and filename of the Image to load.
  * - spriteWidth (Number): The width in pixels of each sprite on the spriteset.
  *                         If you are loading a single sprite, this should be
  *                         the width of the image itself.
  * - spriteHeight (Number): The height in pixels of each sprite on the spriteset.
  *                          If you are loading a single sprite, this should be
  *                          the height of the image itself.
  *
  * To create an instance of a [[SGF.Spriteset]], you must first know the
  * relative path of the image file in your game folder, and you must know
  * the width and height of each sprite in pixels on this [[SGF.Spriteset]].
  *
  * Once instantiated, there are no instance methods to call, you just need
  * to pass the reference to this [[SGF.Spriteset]] to new [[SGF.Sprite]]s.
  **/
function Spriteset(game, path, spriteWidth, spriteHeight, onLoad) {
    var self = this;
    
    EventEmitter.call(self);
    
    self['spriteWidth'] = spriteWidth;
    self['spriteHeight'] = spriteHeight;

    if (onLoad) {
        self['addListener']("load", onLoad);
    }

    var img = new Image();
    img['style']['position'] = "absolute";
    img['onload'] = function() {
        self['width'] = img['width'];
        self['height'] = img['height'];
        self['loaded'] = true;
        self['fireEvent']("load");
    };

    self['image'] = img;

    // Finally begin loading the image itself!
    self['src'] = img['src'] = game['root'] + path;
}
Spriteset['subclasses'] = [];
// so that (spritesetInstance instanceof EventEmitter) === true
Spriteset.prototype = new EventEmitter(true);

/**
 * Spriteset#loaded -> Boolean
 *
 * `false` immediately after instantiation, `true` once the Image file
 * has been completely loaded into memory.
 **/
Spriteset.prototype['loaded'] = false;

/**
 * SGF.Spriteset#width -> Number
 *
 * Read-only. The total width of this [[SGF.Spriteset]]. The value of this
 * property is `-1` before it has loaded completely
 * (i.e. [[SGF.Spriteset#loaded]] == false).
 **/
Spriteset.prototype['width'] = -1;

/**
 * SGF.Spriteset#height -> Number
 *
 * Read-only. The total height of this [[SGF.Spriteset]]. The value of this
 * property is `-1` before it has loaded completely
 * (i.e. [[SGF.Spriteset#loaded]] == false).
 **/
Spriteset.prototype['height'] = -1;

/**
 * SGF.Spriteset#spriteWidth -> Number
 *
 * Read-only. The width of each sprite on this [[SGF.Spriteset]]. This
 * is the value that was set in the constructor.
 **/
Spriteset.prototype['spriteWidth'] = -1;

/**
 * SGF.Spriteset#spriteHeight -> Number
 *
 * Read-only. The height of each sprite on this [[SGF.Spriteset]]. This
 * is the value that was set in the constructor.
 **/
Spriteset.prototype['spriteHeight'] = -1;

/**
 * Spriteset#src -> String
 * 
 * The absolute URL to the image resource.
 **/
Spriteset.prototype['src'] = null;

Spriteset.prototype['toElement'] = function() {
    return this.image.cloneNode(true);
}

Spriteset.prototype['toString'] = function() {
    return "[object Spriteset]";
}

modules['spriteset'] = Spriteset;


    
    // The main SGF namespace.
    var SGF = new EventEmitter();
    SGF['toString'] = function() {
        return "[object SGF]";
    }

    // Attempts to retrieve the absolute path of the executing script.
    // Use this in conjunction with 'getScript' to get a reference to
    // the currently executing script DOM node.
    function getScriptName(callback) {
        try {
            // Intentionally invoke an exception
            (0)();
        } catch(e) {
            // Getting the URL of the exception is non-standard, and
            // different in EVERY browser unfortunately.
            var s = e['stack'];
            if (e['sourceURL']) { // Safari
                //console.log("safari");
                callback(e['sourceURL']);
            } else if (e['arguments']) { // Chrome
                //console.log("chrome");
                s = s.split("\n")[2];
                s = s.substring(s.indexOf("(")+1);
                s = s.substring(0, s.lastIndexOf(":"));
                callback(s.substring(0, s.lastIndexOf(":")));
            } else if (s) { // Firefox & Opera 10+
                //console.log("firefox");
                s = s.split("\n")[0];
                s = s.substring(s.indexOf("@")+1);
                callback(s.substring(0, s.lastIndexOf(":")));
            } else { // Internet Explorer
                //console.log("internet explorer");
                var origOnError = window['onerror'];
                window['onerror'] = function(msg, url){
                    window['onerror'] = origOnError;
                    callback(url);
                    return true;
                }
                throw e;
            }
        }
    }
    
    // Attempts to retrieve a reference to the currently executing
    // DOM node. The node can then be inspected for any user-given
    // runtime arguments (data-* attributes) on the <script>.
    function getScript(scriptName) {
        var scripts = document.getElementsByTagName("script"),
            length = scripts.length;
        while (length--) {
            if (scripts[length]['src'] === scriptName)
                return scripts[length];
        }
    }

    // Looks through the script node and extracts any 'data-*'
    // user parameters to use, and adds them to the 'params' var.
    function getParams(scriptNode) {
        var length = scriptNode.attributes.length;
        while (length--) {
            var name = scriptNode.attributes[length].nodeName;
            if (name.indexOf("data-") === 0) {
                params[name.substring(5)] = scriptNode.getAttribute(name);
            }
        }
    }


    //////////////////////////////////////////////////////////////////////
    ///////////////////// "LIBRARY" FUNCTIONS ////////////////////////////
    //////////////////////////////////////////////////////////////////////

    // Called repeadedly after each library file is loaded. Checks to see
    // if all required libraries have been loaded, and if so begins the next
    // stage of initializing SGF.
    function libraryLoaded(e) {
        var ready = isPrototypeLoaded()
                &&  isSwfObjectLoaded()
                &&  isSoundJsLoaded();
        if (ready) {
            allLibrariesLoaded();
        }
    }

    // Returns true if Prototype, AT LEAST version 1.6.1, is loaded, false
    // otherwise.
    function isPrototypeLoaded() {
        var proto = "Prototype", isLoaded = false;
        if (proto in window) {
            var mainVersion = parseFloat(window[proto]['Version'].substring(0,3));
            if (mainVersion > 1.6 || (mainVersion == 1.6 && parseInt(window[proto]['Version'].charAt(4)) >= 1)) {
                isLoaded = true;
            }
        }
        return isLoaded;
    }
    
    // Called once Prototype (v1.6.1 or better) is assured loaded
    function prototypeLoaded() {
        loadElementSetStyleImportant();
        loadElementSetRotation();
        libraryLoaded();
    }
    
    // Returns true if Sound.js is loaded, false otherwise.
    function isSoundJsLoaded() {
        return 'Sound' in window;
    }

    // Returns true if SWFObject, at least version 2.2, is loaded, false otherwise.
    function isSwfObjectLoaded() {
        var swfobject = 'swfobject', embedSWF = 'embedSWF';
        return swfobject in window && embedSWF in window[swfobject];
    }
    
    // Called once SWFObject (v2.2 or better) is assured loaded
    function swfObjectLoaded() {
        // Load Sound.js
        if (!isSoundJsLoaded()) {
            new Script(engineRoot + params['soundjs'], function() {
                window['Sound']['swfPath'] = engineRoot + "lib/Sound.swf";
                libraryLoaded();
            });
        }
        
        // Load gimite's Flash WebSocket implementation (only if required)
        //if (!'WebSocket' in window) {
            // TODO: Add Flash WebSocket fallback
        //}
    }

    
    /* The DOM nodes that SGF manipulates are always modified through
     * JavaScript, but just setting style.blah won't overwrite !important
     * in CSS style sheets. In order to compensate, all style changes must
     * be ensured that they use !important as well
     **/
    function loadElementSetStyleImportant() {
        Element['addMethods']({
            'setStyleI': (function(){ 
                if (document.documentElement.style.setProperty) {
                    // W3C says use setProperty, with the "important" 3rd param
                    return function(element, prop, value) {
                        element.style.setProperty(prop, value, "important");
                    }                    
                } else {
                    // IE doesn't support setProperty, so we must manually set
                    // the cssText, including the !important statement
                    return function(element, prop, value) {
                        element.style.cssText += ";"+prop+":"+value+" !important;";
                    }
                }
            })()
        });
    }

    /*
     * This loads Element#setRotation, which is a variation of Element#transform
     * from Scripty2, but with the scale hard-coded at 1, and rotation being the
     * only affected value.
     **/
    function loadElementSetRotation() {
        var transform;

        if(window['CSSMatrix']) transform = function(element, transform){
            element.style['transform'] = 'rotate('+(transform||0)+'rad)';
            return element;
        };
        else if(window['WebKitCSSMatrix']) transform = function(element, transform){
            element.style['webkitTransform'] = 'rotate('+(transform||0)+'rad)';
            return element;
        };
        else if(Prototype['Browser']['Gecko']) transform = function(element, transform){
            element.style['MozTransform'] = 'rotate('+(transform||0)+'rad)';
            return element;
        };
        else if(Prototype['Browser']['IE']) transform = function(element, transform){
            if(!element._oDims)
                element._oDims = [element.offsetWidth, element.offsetHeight];
            var c = Math.cos(transform||0) * 1, s = Math.sin(transform||0) * 1;
            
            try {
                var matrix = element['filters']("DXImageTransform.Microsoft.Matrix");
                //matrix.sizingMethod = "auto expand";
                matrix['M11'] = c;
                matrix['M21'] = -s;
                matrix['M12'] = s;
                matrix['M22'] = c;
            } catch (ex) {
                element.style['filter'] += " progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand',M11="+c+",M12="+(-s)+",M21="+s+",M22="+c+")";
            }
            element.style.marginLeft = (element._oDims[0]-element.offsetWidth)/2+'px';
            element.style.marginTop = (element._oDims[1]-element.offsetHeight)/2+'px';
            return element;
        };
        else transform = function(element){ return element; }

        Element['addMethods']({ 'setRotation': transform });
    }


    //////////////////////////////////////////////////////////////////////
    ///////////////////// "UTILITY" FUNCTIONS ////////////////////////////
    //////////////////////////////////////////////////////////////////////
    
    // An empty function.
    function emptyFunction() {}
        
    // Array Remove - By John Resig (MIT Licensed)
    function arrayRemove(array, from, to) {
      var rest = array.slice((to || from) + 1 || array.length);
      array.length = from < 0 ? array.length + from : from;
      return array.push.apply(array, rest);
    }


    //////////////////////////////////////////////////////////////////////
    ////////////////////// "EVENT" FUNCTIONS /////////////////////////////
    //////////////////////////////////////////////////////////////////////

    // Called as an 'event' (possibly asynchronously) once the absolute
    // URL of the executing JavaScript file is known.
    function scriptNameKnown(n) {
        scriptName = n;
        engineRoot = scriptName.substring(0, scriptName.lastIndexOf("/")+1);
        scriptNode = getScript(scriptName);
        getParams(scriptNode);
        
        // The first real matter of buisness: load dependant libraries
        if (isPrototypeLoaded()) {
            prototypeLoaded();
        } else {
            new Script((params['prototype'].indexOf("lib") === 0 ? engineRoot : "") + params['prototype'], prototypeLoaded);
        }
        if (isSwfObjectLoaded()) {
            swfObjectLoaded();
        } else {
            new Script(engineRoot + params['swfobject'], swfObjectLoaded);
        }
        
    }

    // Called as an 'event' (asynchronously) once all the required library
    // files have finished their loading process. Once this happens, we can
    // define all the SGF classes, and afterwards invoke the 'load' listeners.
    function allLibrariesLoaded() {
        log("all libs loaded!");
        
        // These comments below are directives for the 'compile' script.
        // The comments themselves will be replaced by the contents of the
        // script file from the name in the comment.
        
        /**
 * == Networking API ==
 * SGF offers a low-level socket connection through the WebSocket protocol.
 * This allows for real time networking inside your game.
 * All game clients **MUST** implement [[Client]], but only capable game
 * clients should implement [[Server]].
 **/

/** section: Networking API
 * class Client
 *
 * Connects to remote instances of [[Server]], or any other compliant
 * WebSocket server.
 *
 * An [[Client]] instance by itself does nothing except connect to the
 * specified server. You must implement an `onOpen`, `onClose`, and `onMessage`
 * function in either a subclass:
 *
 *     Class.create(Client, {
 *         onOpen: function() {
 *             // Connection to WebSocket has been established.
 *         },
 *         onClose: function() {
 *             // WebSocket connection has been closed.
 *         },
 *         onMessage: function(message) {
 *             // A message has been recieved from the server.
 *             SGF.log(message);
 *         }
 *     });
 *
 * or by directly setting the functions on a standard [[SGF.Client]] instance:
 *
 *     var conn = new Client("ws://somegameserver");
 *     conn.onOpen = function() {
 *         // Connection to WebSocket has been established.
 *     };
 *     conn.onClose = function() {
 *         // WebSocket connection has been closed.
 *     };
 *     conn.onMessage = function(message) {
 *         // A message has been recieved from the server.
 *         SGF.log(message);
 *     };
 **/
var Client = Class.create({
    /**
     * new SGF.Client(url[, options])
     * - url (String): The WebSocket URL to the server to connect to. This should
     *                 use the `ws` protocol, port 80 by default. Ex: `ws://mygame.com:8080`
     * - options (Object): The optional `options` object's properties are copied
     *                     to the [[SGF.Client]] instance. Allows all the same
     *                     values as found in [[SGF.Client.DEFAULTS]].
     *
     * Instantiates a new [[SGF.Client]], using the options found in the
     * `options` parameter to configure. Clients do not make a socket connection
     * during construction (unlike the WebSocket API in HTML 5). To connect to
     * the server, the [[SGF.Client#connect]] method must be called first.
     **/
    initialize: function(url, options) {
        Object.extend(this, Object.extend(Object.clone(SGF.Client.DEFAULTS), options || {}));
        this.URL = url;
        this.__bindedOnOpen = this.__onOpen.bind(this);
        this.__bindedOnClose = this.__onClose.bind(this);
        this.__bindedOnMessage = this.__onMessage.bind(this);

        if (this.autoconnect === true) this.connect();
    },
    /**
     * SGF.Client#onOpen() -> undefined
     *
     * Event handler that is called after an invokation to [[SGF.Client#connect]]
     * has been successful, and a proper WebSocket connection has been established.
     * You must implement this function in a subclass to be useful.
     **/
    onOpen: Prototype.emptyFunction,
    /**
     * SGF.Client#onClose() -> undefined
     *
     * Event handler that is called after an invokation to [[SGF.Client#close]]
     * has been called, resulting in a socket being closed. That is, if you call
     * [[SGF.Client#close]] on an instance that is already closed, then this
     * event will not be called.
     * Perhaps more importantly, this event will be called if the server closes
     * the connection (either directly through code or otherwise).
     * You must implement this function in a subclass to be useful.
     **/
    onClose: Prototype.emptyFunction,
    /**
     * SGF.Client#onMessage(message) -> undefined
     * - message (String): The String value of the message sent from the server.
     *
     * Event handler that is called after the server sends a message to this
     * instance through the network. You must implement this function in a
     * subclass to be useful with the `message` value in your game.
     **/
    onMessage: Prototype.emptyFunction,
    /**
     * SGF.Client#connect() -> undefined
     *
     * Makes this [[SGF.Client]] instance attempt to connect to the currently
     * set WebSocket server. This function will connect the underlying socket
     * connection on a network level, and call the [[SGF.Client#onOpen]] event
     * when the connection is properly established, and the WebSocket handshake
     * is successful.
     **/
    connect: function() {
        this.__ws = new WebSocket(this.URL);
        this.__ws.onopen = this.__bindedOnOpen;
        this.__ws.onclose = this.__bindedOnClose;
        this.__ws.onmessage = this.__bindedOnMessage;
    },
    /**
     * SGF.Client#close() -> undefined
     *
     * Closes the underlying socket connection from the server, if there is a
     * connection, and calls the [[SGF.Client#onClose]] event when complete.
     * If the connection is already closed, then this function does nothing, and
     * the `onClose` event is not fired.
     **/
    close: function() {
        if (this.__ws) {
            this.__ws.close();
        }
    },
    /**
     * SGF.Client#send(message) -> undefined
     * - message (String): The String that you will be sending to the server.
     *
     * Sends `message` to the currently connected server if it is connected.
     * If this [[SGF.Client]] instance is not connected when this is called,
     * then an exception is thrown. As such, it's a good idea to place calls
     * to [[SGF.Client#send]] inside of a try catch block:
     *
     *     try {
     *         client.send("hello server!");
     *     } catch(ex) {
     *         SGF.log(ex);
     *     }
     *
     * A use case when an exception is thrown would be to add `message` to some
     * sort of queue that gets sent during the [[SGF.Client#onOpen]] event.
     **/
    send: function(message) {
        this.__ws.send(message);
    },
    __onOpen: function() {
        this.onOpen();
    },
    __onClose: function() {
        this.onClose();
        this.__ws = null;
    },
    __onMessage: function(event) {
        this.onMessage(event.data);
    }
});

Object.extend(Client, {
    /**
     * SGF.Client.DEFAULTS -> Object
     *
     * The default values used when creating [[SGF.Client]]s. These values are
     * copied onto the [[SGF.Client]] instance, if they are not found in the
     * `options` parameter in the constructor.
     *
     * The [[SGF.Client.DEFAULTS]] object contains the default values:
     *
     *  - `autoconnect`: Default `false`. Boolean determining whether to call
     *  [[SGF.Client#connect]] at the end of construction.
     **/
    DEFAULTS: {
        autoconnect: false
    },
    CONNECTING: 0,
    OPEN:       1,
    CLOSED:     2
});

modules['client'] = Client;
/** section: Networking API
 * class SGF.Server
 *
 * Acts as a server to maintain connections between multiple instances of your
 * game (and possibly even different game clients!).
 *
 * Underneath the hood, [[SGF.Server]] is intended to implement a WebSocket
 * server that rejects anything but valid WebSocket connection requests.
 *
 * Using this class is useful for game client to game client (peer-to-peer)
 * communication. It is entirely possible, however, to write a more dedicated
 * server for your game by
 * <a href="http://github.com/TooTallNate/Java-WebSocket#readme">Writing
 * Your Own WebSocket Server</a>. You would be more likely able to hard-code
 * the server address at that point in your game, making it more seamless for
 * your users.
 **/
var Server = Class.create({
    /**
     * new SGF.Server([options])
     * - options (Object): The optional `options` object's properties are copied
     *                     to the [[SGF.Server]] instance. Allows all the same
     *                     values as found in [[SGF.Server.DEFAULTS]].
     *
     * Instantiates a new [[SGF.Server]], using the options found in the
     * `options` parameter to configure.
     **/
    initialize: function() {
        throw "The HTML/DOM client is not capable of starting a Server.";
    },
    /**
     * SGF.Server#start() -> undefined
     *
     * Starts the underlying WebSocket server listening on the currently
     * configured port number.
     **/
     start:null,
    /**
     * SGF.Server#stop() -> undefined
     *
     * Stops the server from listening on the specified port. If the server is
     * currently running, then [[SGF.Server#onClientClose]] will be called for
     * all current connections.
     **/
     stop:null,
    /**
     * SGF.Server#connections() -> Array
     *
     * Gets an [[SGF.Client]] array of the currerntly connected clients. These
     * instances can be used to individually send messages or close a client.
     **/
     
    /**
     * SGF.Server#sendToAll(message) -> undefined
     * - message (String): The message to send to all current connections.
     *
     * Sends `message` to all currently connected game clients.
     **/
     sendToAll:null,
    /**
     * SGF.Server#onClientOpen(client) -> undefined
     * - client (SGF.Client): The connection instance, in case you would like to
     *                        [[SGF.Client#send]] or [[SGF.Client#close]] this
     *                        connection specifically.
     *
     * Event handler that is called every time a WebSocket client makes a
     * connection to this server. This function should be overridden in a
     * subclass to actually be any useful.
     **/
     onClientOpen:null,
    /**
     * SGF.Server#onClientClose(client) -> undefined
     * - client (SGF.Client): The connection instance. Note that the connection
     *                        to the client has been closed at this point, and
     *                        calling [[SGF.Client#send]] or [[SGF.Client#close]]
     *                        will throw an exception.
     *
     * Event handler that is called every time a WebSocket client disconnects
     * from this server. This function should be overridden in a  subclass to
     * actually be any useful. Be careful not to call [[SGF.Client#send]] or
     * [[SGF.Client#close]] on the `client` instance, since it's socket
     * connection has been closed.
     **/
     onClientClose:null,
    /**
     * SGF.Server#onClientMessage(client, message) -> undefined
     * - client (SGF.Client): The connection instance, in case you would like to
     *                        [[SGF.Client#send]] or [[SGF.Client#close]] this
     *                        connection specifically.
     * - message (String): The String value of the message sent from `client`.
     *
     * Event handler that is called every time a WebSocket client sends a
     * message to this server. This function should be overridden in a subclass
     * to actually be any useful.
     **/
     onClientMessage:null
});

/**
 * SGF.Server.canServe -> Boolean
 *
 * Use this property to determine whether or not the current game client engine
 * has implemented [[SGF.Server]]. This value, for instance, is `false` on web
 * browser based game engines, as a web browser is not capable of starting it's
 * own WebSocket server. On the Java game engine, this value is `true`, as Java
 * has a WebSocket server written for it that can be used by your game.
 *
 *     if (SGF.Server.canServe) {
 *         var server = new SGF.Server();
 *         server.start();
 *     }
 **/
Server.canServe = false;

/**
 * SGF.Server.DEFAULTS -> Object
 *
 * The default values used when creating [[SGF.Server]]s. These values are
 * copied onto the [[SGF.Server]], if they are not found in the `options`
 * argument in the constructor.
 *
 * The [[SGF.Server.DEFAULTS]] object contains the default values:
 *
 *  - `port`: Default `8080`. The socket port number that this WebSocket server
 *  will bind to. Note that ports less than `1024` require administrator
 *  permissions to bind to by most operating systems, so if you would like to
 *  bind to one of those ports, you must always launch the implementing game
 *  client with administrator permissions.
 *  - `autostart`: Default `false`. Boolean determining whether to call
 *  [[SGF.Server#start]] at the end of construction.
 **/

modules['server'] = Server;


        /**
 * == Components API ==
 * "Components" are the Object Oriented classes that are created by your game code,
 * added to your game loop and rendered on the screen.
 **/

/** section: Components API
 * class SGF.Component
 *
 * An abstract base class for game components. It cannot be instantiated
 * directly, but its subclasses are the building blocks for SGF games.
 **/
var Component = Class.create({
    initialize: function(options) {
        if (options) {
            Object.extend(this, options);
        }
        this.element = this.getElement();
    },
    /*
     * SGF.Component#getElement() -> Element
     * Internal method. Game developers need not be aware.
     **/
    getElement: (function() {
        var e = document.createElement("div");
        Element['setStyleI'](e, "position", "absolute");
        Element['setStyleI'](e, "overflow", "hidden");
        return function() {
            return e.cloneNode(false);
        }
    })(),
    toElement: function() {
        return this.element;
    },
    /**
     * SGF.Component#left() -> Number
     * 
     * Returns the number of pixels from left side of the screen to the left
     * side of the [[SGF.Component]].
     **/
    left: function() {
        return this.x;
    },
    /**
     * SGF.Component#top() -> Number
     *
     * Returns the number of pixels from the top of the screen to the top
     * of the [[SGF.Component]].
     **/
    top: function() {
        return this.y;
    },
    /**
     * SGF.Component#right() -> Number
     *
     * Returns the number of pixels from left side of the screen to the right
     * side of the [[SGF.Component]].
     **/
    right: function() {
        return this.x + this.width - 1;
    },
    /**
     * SGF.Component#bottom() -> Number
     * 
     * Returns the number of pixels from the top side of the screen to the
     * bottom of the [[SGF.Component]].
     **/
    bottom: function() {
        return this.y + this.height - 1;
    },
    /**
     * SGF.Component#render(interpolation, renderCount) -> undefined
     * - interpolation (Number): The percentage (value between 0.0 and 1.0)
     *                           between the last call to update and the next
     *                           call to update this call to render is taking place.
     *                           This number is used to "predict" the location of
     *                           this [[SGF.Component]] if the FPS are higher than
     *                           UPS, and the [[SGF.Component#dx]]/[[SGF.Component#dy]]
     *                           values are being used.
     * - renderCount (Number): The total number of times that [[SGF.Game#render]]
     *                         has been called for this game. This value has nothing
     *                         to do with the number of times this [[SGF.Component]]
     *                         has been rendered.
     * 
     * Renders the individual [[SGF.Component]]. This is called automatically in
     * the game loop once this component has been added through [[SGF.Game#addComponent]].
     *
     * Subclasses of [[SGF.Component]] override this method, and render how it
     * should be rendered. This default implementation does nothing, since
     * a [[SGF.Component]] itself cannot be rendered/instantiated.
     **/
    render: function(renderCount) {
        if (this.__rotation != this.rotation) {
            Element['setRotation'](this.element, this.rotation); // Radians
            this.__rotation = this.rotation;
        }

        if (this.__opacity != this.opacity) {
            Element['setOpacity'](this.element, this.opacity);
            this.__opacity = this.opacity;
        }

        if (this.__zIndex != this.zIndex) {
            this.__fixZIndex();
            this.__zIndex = this.zIndex;
        }

        if (this.__width != this.width) {
            Element['setStyleI'](this.element, "width", (this.width) + "px");
            this.__width = this.width;
        }
        if (this.__height != this.height) {
            Element['setStyleI'](this.element, "height", (this.height) + "px");
            this.__height = this.height;
        }

        if (this.__x != this.x) {
            this.__x = this.x;
            Element['setStyleI'](this.element, "left", (this.x) + "px");
        }

        if (this.__y != this.y) {
            this.__y = this.y;
            Element['setStyleI'](this.element, "top", (this.y) + "px");
        }
    },
    /**
     * SGF.Component#update(updateCount) -> undefined
     * - updateCount (Number): The total number of times that [[SGF.Game#update]]
     *                         has been called for this game. This value has nothing
     *                         to do with the number of times this [[SGF.Component]]
     *                         has been updated.
     *
     * Updates the state of the individual [[SGF.Component]]. This is called in
     * the game loop once this component has been added through
     * [[SGF.Game#addComponent]].
     *
     * This function should be thought of as the "logic" function for the [[SGF.Component]].
     **/
    update: function() {
    },
    __fixZIndex: function() {
        var z = this.parent && this.parent.__computeChildZIndex ?
            this.parent.__computeChildZIndex(this.zIndex) :
            this.zIndex;
        Element['setStyleI'](this.element, "z-index", z);
    }
});

/**
 * SGF.Component#width -> Number
 *
 * The width of the [[SGF.Component]]. This is a readable and writable
 * property. That is, if you would like to reize the [[SGF.Component]],
 * you could try something like:
 *
 *     this.width = this.width * 2;
 *
 * To double the current width of the [[SGF.Component]].
 **/
Component.prototype.width = 10;

/**
 * SGF.Component#height -> Number
 *
 * The height of the [[SGF.Component]]. This is a readable and writable
 * property. That is, if you would like to reize the [[SGF.Component]],
 * you could try something like:
 *
 *     this.height = SGF.Screen.height;
 *
 * To set the height of this [[SGF.Component]] to the current height of the
 * game screen.
 **/
Component.prototype.height = 10;

/**
 * SGF.Component#x -> Number
 *
 * The X coordinate of the top-left point of the [[SGF.Component]] from the
 * top-left of the game screen.
 *
 *     update: function($super) {
 *         this.x++;
 *         $super();
 *     }
 *
 * This is an example of overwritting the [[SGF.Component#update]] method,
 * and incrementing the X coordinate every step through the game loop.
 * This will smoothly pan the [[SGF.Component]] across the game screen at
 * the [[SGF.Game]]'s set game speed.
 **/
Component.prototype.x = 0;

/**
 * SGF.Component#y -> Number
 *
 * The Y coordinate of the top-left point of the [[SGF.Component]] from the
 * top-left of the game screen.
 **/
Component.prototype.y = 0;
/**
 * SGF.Component#opacity -> Number
 *
 * A percentage value (between 0.0 and 1.0, inclusive) that describes the
 * [[SGF.Component]]'s opacity. Setting this value to 1.0 (default) will
 * make the [[SGF.Component]] fully opaque. Setting to 0.0 will make it
 * fully transparent, or invisible. Setting to 0.5 will make it 50%
 * transparent. You get the idea...
 **/
Component.prototype.opacity = 1.0;
/**
 * SGF.Component#rotation -> Number
 *
 * The rotation value of the [[SGF.Component]] in degrees. Note that the
 * [[SGF.Component#x]], [[SGF.Component#y]] properties, and values returned
 * from [[SGF.Component#left]], [[SGF.Component#right]], [[SGF.Component#top]],
 * and [[SGF.Component#bottom]] are not affected by this value. Therefore,
 * any calculations that require the rotation to be a factor, your game code
 * must calculate itself.
 **/
Component.prototype.rotation = 0;

/**
 * SGF.Component#zIndex -> Number
 *
 * The Z index of this [[SGF.Component]]. Setting this value higher than
 * other [[SGF.Component]]s will render this [[SGF.Component]] above ones
 * with a lower **zIndex**.
 **/
Component.prototype.zIndex = 0;

/**
 * SGF.Component#parent -> SGF.Container | SGF.Game 
 *  
 * A reference to the current parent component of this component, or `null`
 * if the component is not currently placed inside any containing component.
 *
 * If the component is a top-level component (added through
 * [[SGF.Game#addComponent]]) then [[SGF.Component#parent]] will be
 * [[SGF.Game.current]] (your game instance).
 **/
Component.prototype.parent = null;

modules['component'] = Component;

/** section: Components API
 * class SGF.Container < SGF.Component
 *
 * A `SGF.Container` is a concrete [[SGF.Component]] subclass, that acts
 * similar to the main [[SGF.Screen]] itself. That is, you can add
 * `SGF.Component`s into a container just like you would in your game.
 * Components placed inside containers are rendered with their attributes
 * relative to the Container's attributes. `SGF.Container` supports
 * all the regular [[SGF.Component]] properties (i.e. `width`, `height`, `x`,
 * `y`, `dx`, `dy`, `opacity`, `rotation`, and `zIndex`) Changing the properties
 * on a Container affect the global properties of the Components placed inside.
 **/
var Container = Class.create(Component, {
    /**
     * new SGF.Container(components[, options])
     * - components (Array): An array of [[SGF.Component]]s that should initally
     *                       be placed into the container. This is a required
     *                       argument, however it can be an empty array. Also
     *                       note that you can add or remove `SGF.Component`s
     *                       at any time via [[SGF.Container#addComponent]] and
     *                       [[SGF.Container#removeComponent]].
     *                       
     * - options (Object): The optional 'options' object's properties are copied
     *                     this [[SGF.Container]] in the constructor. It allows all
     *                     the same default properties as [[SGF.Component]].
     *
     * Instantiates a new [[SGF.Container]], adding the [[SGF.Component]]s found
     * in `components` initially.
     **/
    initialize: function($super, components, options) {
        this.components = [];
        $super(Object.extend(this, options || {}));
        if (Object.isArray(components)) {
            components.each(this.addComponent, this);
        }
        this.__shouldUpdateComponents = this.__needsRender = true;
    },
    update: function($super, updateCount) {
        $super(updateCount);
        if (this.__shouldUpdateComponents) {
            for (var i=0; i<this.components.length; i++) {
                if (this.components[i].update)
                    this.components[i].update(updateCount);
            }
        }
    },
    render: function($super, renderCount) {
        $super(renderCount);
        if (this.__needsRender) {
            this.__renderComponents(renderCount);
        }
    },
    __renderComponents: function(renderCount) {
        for (var i=0; i < this.components.length; i++) {
            if (this.components[i].render)
                this.components[i].render(renderCount);
        }
    },


    /**
     * SGF.Container#addComponent(component) -> SGF.Container
     * - component (SGF.Component): The `SGF.Component` instance to add to this
     *                              container.
     *
     * Adds an [[SGF.Component]] into the container. `component`'s attributes
     * will be rendered in relation to the attributes of this `SGF.Container`.
     **/
    addComponent: function(component) {
        if (component.parent !== this) {
            if (component.parent)
                component.parent.removeComponent(component);
            this.components.push(component);
            this.element.appendChild(component.element);
            component.parent = this;
            component.__fixZIndex();
        }
        return this;
    },
    
    /**
     * SGF.Container#removeComponent(component) -> SGF.Container
     * - component (SGF.Component): The `SGF.Component` instance to add to this
     *                              container.
     *
     * Removes an [[SGF.Component]] from the container that has previously been
     * added to this container via [[SGF.Container#addComponent]].
     **/
    removeComponent: function(component) {
        var index = this.components.indexOf(component);
        if (index > -1) {
            arrayRemove(this.components, index);
            component.element.remove();
            component.parent = null;
        }
        return this;
    },
    __computeChildZIndex: function(zIndex) {
        return (parseInt(this.element.style.zIndex) || 0) + (parseInt(zIndex) || 0);
    },
    __fixZIndex: function($super) {
        $super();
        for (var i=0; i < this.components.length; i++) {
            this.components[i].__fixZIndex();
        }
    }
});

modules['container'] = Container;
/** section: Components API
 * class SGF.DumbContainer < SGF.Container
 *
 * There are plenty of cases where a large amount of [[SGF.Component]]s are going
 * to be placed inside of a [[SGF.Container]], BUT NEVER CHANGE. This scenario
 * can be brought up by creating a tile based map using [[SGF.Sprite]]. Map's don't
 * change beyond their initialization (usually), so it's a waste of CPU to
 * re-render and check for updates of each individual tile, because we know that
 * they will never need to change. That very scenario is why [[SGF.DumbContainer]]
 * exists. Using a `DumbContainer`, all the tile sprites that were added to the
 * container will only be rendered once, and then re-blitted to the screen for
 * maximum speed.
 *
 * So in short, use [[SGF.DumbContainer]] when the components inside will never
 * need to be changed, and save a lot of processing power.
 **/
var DumbContainer = Class.create(Container, {
    initialize: function($super, components, options) {
        $super(components, options);
        this.__shouldUpdateComponents = this.__needsRender = false;
    },

    addComponent: function($super, component) {
        $super(component);
        this.__needsRender = true;
        return this;
    },
    removeComponent: function($super, component) {
        $super(component);
        this.__needsRender = true;
        return this;
    },

    render: function($super, interpolation, renderCount) {
        if (this.width != this.__width || this.height != this.__height)
            this.__needsRender = true;
        $super(interpolation, renderCount);
    },
    
    __renderComponents: function($super, interpolation, renderCount) {
        $super(interpolation, renderCount);
        this.__needsRender = false;
    },

    renderComponents: function() {
        this.__needsRender = true;
    }
});

modules['dumbcontainer'] = DumbContainer;


var Label = Class.create(Component, {
    initialize: function($super, options) {
        $super(Object.extend(Object.clone(Label.DEFAULTS), options || {}));
        this.__text = "";
        this.__textNode = document.createTextNode(this.__text);
        this.element.appendChild(this.__textNode);
    },
    getElement: (function() {
        var e = document.createElement("pre");
        $H({
            "border":"none 0px #000000",
            "background-color":"transparent",
            "position":"absolute",
            "overflow":"hidden",
            "margin":"0px",
            "padding":"0px"
        })['each'](function(prop) {
            Element['setStyleI'](e, prop['key'], prop['value']);
        });
        return function() {
            var el = e.cloneNode(false);
            Element['setStyleI'](el, "color", "#"+this.color);
            this.__color = this.color;
            Element['setStyleI'](el, "font-family", this.font.__fontName);
            this.__font = this.font;
            Element['setStyleI'](el, "font-size", this.size + "px");
            Element['setStyleI'](el, "line-height", this.size + "px");
            this.__size = this.size;
            return el;
        }
    })(),
    render: function($super, renderCount) {
        $super(renderCount);
        if (this.__align !== this.align) {
            Element['setStyleI'](this.element, "text-align", this.align == 0 ? "left" : this.align == 1 ? "center" : "right");
            this.__align = this.align;
        }
        if (this.__font !== this.font) {
            Element['setStyleI'](this.element, "font-family", this.font.__fontName);
            this.__font = this.font;
        }
        if (this.__size !== this.size) {
            var val = (this.size) + "px";
            Element['setStyleI'](this.element, "font-size", val);
            Element['setStyleI'](this.element, "line-height", val);            
            this.__size = this.size;
        }
        if (this.__color !== this.color) {
            Element['setStyleI'](this.element, "color", "#"+this.color);
            this.__color = this.color;
        }
        if (this.__textNeedsUpdate === true) {
            var text = "", l = this.__text.length, i=0, pos=0, cur, numSpaces, j;
            for (; i<l; i++) {
                cur = this.__text.charAt(i);
                if (cur === '\n') {
                    pos = 0;
                    text += cur;
                } else if (cur === '\t') {
                    numSpaces = Label.TAB_WIDTH - (pos % Label.TAB_WIDTH);
                    for (j=0; j<numSpaces; j++) {
                        text += ' ';
                    }
                    pos += numSpaces;
                } else {
                    text += cur;
                    pos++;
                }
            }
            if (isIE7orLower) {
                text = text.replace(/\n/g, '\r');
            }
            this.__textNode.nodeValue = text;
            this.__textNeedsUpdate = false;
        }
    },
    getText: function() {
        return this.__text;
    },
    setText: function(textContent) {
        this.__text = textContent;
        this.__textNeedsUpdate = true;
    }
});

var isIE7orLower = (function() {
    /MSIE (\d+\.\d+);/.test(navigator.userAgent);
    return (new Number(RegExp.$1)) <= 7;
})();

Object.extend(Label, {
    'DEFAULTS': {
        'align': 0,
        'color': "FFFFFF",
        'font': new Font("monospace"),
        'size': 12
    },
    'LEFT': 0,
    'CENTER': 1,
    'RIGHT': 2,
    
    'TAB_WIDTH': 4
});

modules['label'] = Label;

/** section: Components API
 * class SGF.Sprite < SGF.Component
 *
 * Probably the most used Class in SGF to develop your games. Represents a single
 * sprite state on a spriteset as a [[SGF.Component]]. The state of the sprite
 * can be changed at any time.
 **/
var Sprite = Class.create(Component, {
    /**
     * new SGF.Sprite(spriteset[, options])
     * - spriteset (SGF.Spriteset): The spriteset for this Sprite to use. This is
     *                              final once instantiated, and cannot be changed.
     * - options (Object): The optional 'options' object's properties are copied
     *                     this [[SGF.Sprite]] in the constructor. It allows all
     *                     the same default properties as [[SGF.Component]], but
     *                     also adds [[SGF.Sprite#spriteX]] and [[SGF.Sprite#spriteY]].
     *
     * Instantiates a new [[SGF.Sprite]] based on the given [[SGF.Spriteset]].
     * It's more common, however, to make your own subclass of [[SGF.Sprite]] in
     * your game code. For example:
     *
     *     var AlienClass = Class.create(SGF.Sprite, {
     *         initialize: function($super, options) {
     *             $super(AlienClass.sharedSpriteset, options);
     *         },
     *         update: function($super) {
     *             // Some cool game logic here...
     *             $super();
     *         }
     *     });
     *
     *     AlienClass.sharedSpriteset = new SGF.Spriteset("alien.png", 25, 25);
     *
     * Here we are creating a [[SGF.Sprite]] subclass called **AlienClass** that
     * reuses the same [[SGF.Spriteset]] object for all instances, and centralizes
     * logic code by overriding the [[SGF.Component#update]] method.
     **/
    initialize: function($super, spriteset, options) {
        this.spriteset = spriteset;
        this.spritesetImg = spriteset.toElement();
        $super(Object.extend(Object.clone(Sprite.DEFAULTS), options || {}));
    },
    getElement: function($super) {
        return $super().insert(this.spritesetImg);
    },
    scale: function($super, newScale) {
        $super(newScale);
        
        if (this.spriteset.loaded) {
            this.resetSpriteset();
        } else {
            this.spriteset.observe("load", this.resetSpriteset.bind(this));
        }
    },
    render: function($super, interpolation, renderCount) {
        if (this.__spriteX != this.spriteX || this.__spriteY != this.spriteY ||
            this.__width != this.width || this.__height != this.height) {
            if (this.spriteset.loaded) {
                this.resetSpriteset();
            } else if (!this.__resetOnLoad) {
                this.spriteset.addListener("load", this.resetSpriteset.bind(this));
                this.__resetOnLoad = true;
            }
        }
        $super(interpolation, renderCount);
    },
    resetSpriteset: function() {
        this.spritesetImg.setStyleI("width", (this.spriteset.width * (this.width/this.spriteset.spriteWidth)) + "px");
        this.spritesetImg.setStyleI("height", (this.spriteset.height * (this.height/this.spriteset.spriteHeight)) + "px");
        this.spritesetImg.setStyleI("top", -(this.height * this.spriteY) + "px");
        this.spritesetImg.setStyleI("left", -(this.width * this.spriteX) + "px");
        this.__spriteX = this.spriteX;
        this.__spriteY = this.spriteY;
    }
});

/**
 * SGF.Sprite#spriteX -> Number
 *
 * The X coordinate of the sprite to use from the spriteset. The units are
 * whole [[SGF.Sprite]] widths. So to use the 3rd sprite across on the spriteset,
 * set this value to 3.
 **/
Sprite.prototype['spriteX'] = 0;

/**
 * SGF.Sprite#spriteY -> Number
 *
 * The Y coordinate of the sprite to use from the spriteset. The units are
 * whole [[SGF.Sprite]] heights. So to use the 4th sprite down on the spriteset,
 * set this value to 4.
 **/
Sprite.prototype['spriteY'] = 0;

modules['sprite'] = Sprite;

/** section: Components API
 * class SGF.Shape < SGF.Component
 *
 * Another abstract class, not meant to be instantiated directly. All "shape"
 * type [[SGF.Component]] classes use this class as a base class. The only
 * functionality that this class itself adds to a regular [[SGF.Component]] is
 * [[SGF.Shape#color]], since all shapes can have a color set for them.
 **/
var Shape = Class.create(Component, {
    /**
     * new SGF.Shape([options])
     * - options (Object): The optional 'options' object's properties are copied
     *                     this [[SGF.Shape]] in the constructor. It allows all
     *                     the same default properties as [[SGF.Component]], but
     *                     also adds [[SGF.Shape#color]].
     *
     * This will never be called directly in your code, use one of the subclasses
     * to instantiate [[SGF.Shape]]s.
     **/
    initialize: function($super, options) {
        $super(Object.extend(Object.clone(Shape.DEFAULTS), options || {}));
    },
    render: function($super, interpolation) {
        //var scale = SGF.Screen.getScale();

        if (this.__fill != this.fill) {
            if (!this.fill) {
                this.element.style.backgroundColor = "transparent";
                this.element.style.border = "Solid 1px #" + this.color;
                //this.element.style.width = ((this.width * scale)-5) + "px";
                //this.element.style.height = ((this.height * scale)-5) + "px";
            } else {
                this.element.style.borderColor = "transparent";
                this.element.style.backgroundColor = "#" + this.color;
            }
            this.__fill = this.fill;
        }

        if (this.__color != this.color) {
            if (this.fill)
                this.element.style.backgroundColor = "#" + this.color;
            else
                this.element.style.borderColor = "#" + this.color;
            this.__color = this.color;
        }

        /*
        if (this.__width != this.width) {
            var w = (this.width * scale);
            this.element.style.width = (this.fill ? w : w-5) + "px";
            this.__width = this.width;
        }
        if (this.__height != this.height) {
            var h = (this.height * scale);
            this.element.style.height = (this.fill ? h : h-5) + "px";
            this.__height = this.height;
        }
        */

        $super(interpolation);
    }
});

/**
 * SGF.Shape.DEFAULTS -> Object
 *
 * The default values used when creating [[SGF.Shapes]]s. These values, as well
 * as the values from [[SGF.Component.DEFAULTS]] are copied onto the [[SGF.Shape]],
 * if they are not found in the `options` argument.
 *
 * The [[SGF.Shape.DEFAULTS]] object contains the default values:
 *
 *     - color: "000000"
 *     - fill: true
 **/
Shape.DEFAULTS = {
    /**
     * SGF.Shape#color -> String
     *
     * The color of the [[SGF.Shape]]. The String value is expected to be like
     * a CSS color string. So it should be a **six** (not three) character
     * String formatted in `RRGGBB` form. Each color is a 2-digit hex number
     * between 0 and 255.
     **/
    color: "000000",
    /**
     * SGF.Shape#fill -> Boolean
     *
     * Boolean determining if the [[SGF.Shape]] should be filled (`true`), or
     * if just the outline should be rendered (`false`).
     **/
    fill: true
};

modules['shape'] = Shape;

/** section: Components API
 * class SGF.Rectangle < SGF.Shape
 *
 * A [[SGF.Component]] that renders a single rectangle onto the screen.
 **/
var Rectangle = Class.create(Shape, {
    initialize: function($super, options) {
        $super(Object.extend(Object.clone(Rectangle.DEFAULTS), options || {}));
    },
    getElement: function() {
        this.__color = this.color;
        return new Element("div").setStyle({
            position: "absolute",
            backgroundColor: "#" + this.color
        });
    }
});

Rectangle.DEFAULTS = {
};

modules['rectangle'] = Rectangle;

var Circle = Class.create(Shape, {
    initialize: function($super, options) {
        $super(Object.extend(Object.clone(SGF.Circle.DEFAULTS), options || {}));
        this.radiusChanged();
    },
    
    getElement: function() {
        this.__color = this.color;
        return new Element("div").setStyle({
            position: "absolute",
            backgroundColor: "#" + this.color
        });
    },
    
    update: function($super) {
        if (this.width != this.height || (this.radius*2) != this.width) {
            this.radiusChanged();
        }
        $super();
    },

    render: (function() {
        if (Prototype.Browser.WebKit) {
            return function($super, interpolation) {
                $super(interpolation);
                if (this.radius != this.__radius) {
                    this.element.style.webkitBorderRadius = (this.radius * SGF.Screen.getScale()) + "px";
                    this.__radius = this.radius;
                }
            };
        } else if (Prototype.Browser.Gecko) {
            return function($super, interpolation) {
                $super(interpolation);
                if (this.radius != this.__radius) {
                    this.element.style.MozBorderRadius = (this.radius * SGF.Screen.getScale()) + "px";
                    this.__radius = this.radius;
                }
            };
        } else {
            SGF.log("A form of Border Radius is not supported by this browser.");
            return function($super, interpolation) {
                $super(interpolation);
            };
        }
    })(),

    radiusChanged: function() {
        this.width = this.height = this.radius*2;
    }
});

Circle.DEFAULTS = {
    radius: 10
};

modules['circle'] = Circle;



        window['SGF'] = SGF;
        
        Input['grab']();
        
        sgfLoaded();
    }
    
    // Called as an 'event' when the SGF engine has finished initializing.
    // At this point, export stuff from the closure to the global scope,
    // then check for the existence of a 'game' or 'game'&'screen' param
    // on the <script> node to begin autoplaying.
    function sgfLoaded() {

        var loadEndTime = new Date();
        log("Load Time: "+(loadEndTime.getTime() - loadStartTime.getTime())+" ms");

        if (params['game']) {
            if (params['screen']) {
                startWithDiv(params['game'], params['screen']);
            } else {
                startFullScreen(params['game']);
            }
        }
        
    }

    


    //////////////////////////////////////////////////////////////////////
    //////////////////// "SGF" PUBLIC FUNCTIONS //////////////////////////
    //////////////////////////////////////////////////////////////////////
    function log() {
        var args = arguments;
        if (window['console'] && console['log']) {
            console['log'].apply(console, args);
        }
        SGF['fireEvent']("log", args);
    }
    SGF['log'] = log;
    
    function require(moduleName) {
        if (typeof moduleName == "string") {
            moduleName = String(moduleName).toLowerCase();
            if (moduleName in modules) {
                return modules[moduleName];                
            }
            throw new Error("SGF.require: module name '" + moduleName + "' does not exist");
        }
        throw new Error("SGF.require: expected argument typeof 'string', got '" + (typeof moduleName) + "'");
    }
    SGF['require'] = require;
    
    function startWithDiv(gameSrc, screen) {
        return new modules['game'](gameSrc, $(screen));
    }
    SGF['startWithDiv'] = startWithDiv;

    function startFullScreen(gameSrc) {
        return startWithDiv(gameSrc, document['body']);
    }
    SGF['startFullScreen'] = startFullScreen;


    //// Start things off... /////////////////////////////////////////////
    getScriptName(scriptNameKnown);

})(this, document);
