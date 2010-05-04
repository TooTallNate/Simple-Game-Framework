/** section: Core API, related to: SGF.Game
* $G() -> SGF.Game
*
* Convienience method for getting your game instance. All it does is return
* `SGF.Game.current`.
**/
function $G() {
    return SGF.Game.current;
}

/** section: Core API
 * class SGF.Game
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
 * The total number of times that [[SGF.Game#update]] has been called throughout
 * the lifetime of this game.
 **/
 
/**
 * SGF.Game#renderCount -> Number
 *
 * The total number of times that [[SGF.Game#render]] has been called throughout
 * the lifetime of this game.
 **/
SGF.Game = Class.create({
    initialize: function(rootUrl, options) {
        SGF.Game.current = this;

        // 'root' is the path to the folder containing the Game's 'main.js' file.
        if (rootUrl.endsWith("main.js")) rootUrl = rootUrl.substring(0, rootUrl.lastIndexOf("main.js"));
        this.root = rootUrl.endsWith('/') ? rootUrl : rootUrl + '/';
        
        // Override the default options with the user defined options
        Object.extend(this, Object.extend(Object.clone(SGF.Game.DEFAULTS), options || {}));

        // Set the initial game speed. This can be changed during gameplay.
        this.setGameSpeed(this.gameSpeed);

        // Init some standard properties
        this.loaded = this.running = false;
        this.startTime = -1;
        this.components = [];
        this.listeners = {
            "load":     [],
            "start":    [],
            "stopping": [],
            "stopped":  []
        }

        // Reset the background color to black at the creation of every game
        SGF.Screen.color = "000000";

        // Keep a "private" reference to a binded 'step' function, for use in
        // the game loop (setTimeout sets 'this' to the 'window' normally).
        var This = this;
        this.__bindedStep = function() {
            This.step();
        }

        // Last step of initialization is to load the Game's 'main.js' file
        this.loadScript("main.js", this.mainFileLoaded.bind(this));
    },

    /**
     * SGF.Game#addComponent(component) -> SGF.Game
     * - component (SGF.Component): The top-level component to add to the game
     *                              loop and begin rendering.
     *                              
     * Adds a [[SGF.Component]] to the game. It will be rendered onto the screen,
     * and considered in the game loop. Returns the [[SGF.Game]] object (this),
     * for chaining.
     **/
    addComponent: function(component) {
        /*
        if (!this.components.include(component)) {
            this.components.push(component);
            SGF.Screen.element.insert(component);
            component.parent = this;
            component.__fixZIndex();
        }
        return this;
        */
        if (component.parent !== this) {
            if (component.parent)
                component.parent.removeComponent(component);
            this.components.push(component);
            SGF.Screen.element.insert(component);
            component.parent = this;
            component.__fixZIndex();
        }
        return this;
    },

    /**
     * SGF.Game#removeComponent(component) -> SGF.Game
     * - component (SGF.Component): The top-level component to remove from the
     *                              game loop and stop rendering.
     *                              
     * Removes a [[SGF.Component]] that has previously been added to the game
     * loop via [[SGF.Game#addComponent]].
     **/
    removeComponent: function(component) {
        var index = this.components.indexOf(component);
        if (index > -1) {
            this.components.remove(index);
            component.toElement().remove();
            component.parent = null;
        }
        return this;
    },

    /**
     * SGF.Game#loadScript(filePath[, onLoad = Prototype.emptyFunction]) -> SGF.Game
     * - filePath (String): The relative path, including filename of the game
     *                      script file to load.
     * - onLoad (Function): Optional. The `Function` to invoke when the script
     *                      file has finished loading and executing.
     *                      
     * Loads a script file from the game's folder into the game environment. The
     * script is immediately executed once it has finished loading. Afterwards,
     * the optional `onLoad` function is called.
     **/
    loadScript: function(relativeUrl, onComplete) {
        SGF.loadScript(this.root + relativeUrl,
            Object.isFunction(onComplete) ? onComplete.bind(SGF.Game.current) : Prototype.emptyFunction);
        return this;
    },

    mainFileLoaded: function() {
        this.loaded = true;
        // Notify all the game's 'load' listeners
        this.listeners.load.invoke("call", this);
        if (this.autostart === true) {
            this.start();
        }
    },

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
    observe: function(eventName, handler) {
        if (!(eventName in this.listeners))
            throw "SGF.Game#observe: '" + eventName + "' is not a recognized event name.";
        if (typeof(handler) !== 'function') throw "'handler' must be a Function."
        this.listeners[eventName].push(handler);
        return this;
    },

    /* HTML/DOM Client specific function
     * Returns the current timestamp in milliseconds.
     * Used continually by the game loop.
     **/
    now: (function() {
        if ("now" in Date)
            return Date.now;
        else
            return function() {
                return (new Date).getTime();
            };
    })(),

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
    render: function(interpolation) {
        for (var i=0; i < this.components.length; i++) {
            if (this.components[i].render)
                this.components[i].render(interpolation, this.renderCount);
        }
        this.renderCount++;
        this.fpsCount++;
    },

    /**
     * SGF.Game#setGameSpeed(updatesPerSecond) -> SGF.Game
     * - updatesPerSecond (Number): The number of updates per second to set this
     *                              game.
     *                              
     * Sets the "Game Speed", or attempted times [[SGF.Game#update]] gets called
     * per second. This can be changed at any point during gameplay. Note that
     * playing sounds and music speed do not get affected by changing this value.
     **/
    setGameSpeed: function(updatesPerSecond) {
        this.gameSpeed = updatesPerSecond;

        // 'period' is the attempted time between each update() call (in ms).
        this.period = 1000 / updatesPerSecond;
    },

    start: function() {
        SGF.log("Starting " + this.root);

        if (!SGF.Input.grabbed) SGF.Input.grab();
        SGF.Input.focus();

        // The 'running' flag is used by step() to determine if the loop should
        // continue or end. No not set directly, use stop() to kill game loop.
        this.running = true;

        // Note when the game started, and when the next
        // call to update() should take place.
        this.startTime = this.nextGamePeriod = this.now();
        this.updateCount = this.renderCount = 0;

        // Start the game loop itself!
        if (SGF.useZeroTimeout && SGF.zeroTimeout) {
            SGF.zeroTimeout(this.__bindedStep);
        } else {
            setTimeout(this.__bindedStep, 0);
        }    

        // Notify game's 'start' listeners
        this.listeners.start.invoke("call", this);


        // DEBUG!! Display stats every second
        //setInterval(this.recordStats.bind(this), 1000);
        // For FPS/UPS, probably temoprary
        this.fpsCount = this.upsCount = 0;
        this.statsTime = this.now();
    },

    /*
     * The main iterator function. Called as fast as the browser can handle
     * (i.e. setTimeout(this.step, 0)) in order to implement variable FPS.
     * This method, however, ensures that update() is called at the requested
     * "gameSpeed", so long as hardware is capable.
     **/
    step: function() {
        // Stop the loop if the 'running' flag is changed.
        if (!this.running) return this.stopped();

        // This while loop calls update() as many times as required depending
        // on the current time and the last time update() was called. This
        // could happen 0 times if the hardware is calling step() more times
        // than the requested 'gameSpeed'. This will result in higher FPS than UPS
        var loops = 0;
        while (this.now() > this.nextGamePeriod && loops < this.maxFrameSkips) {
            this.update();
            this.nextGamePeriod += this.period;
            loops++;
        }

        // Sets the screen background color, screen width and height
        SGF.Screen.reset();

        // Renders all game components, taking the interpolation value
        // to predict where the game objects will be placed.
        //this.render((this.now() + this.period - this.nextGamePeriod) / this.period);
        this.render(0);

        // Continue the game loop, as soon as the browser has time for it,
        // allowing for other JS on the stack to be executed (events, etc.)
        if (SGF.useZeroTimeout && SGF.zeroTimeout) {
            SGF.zeroTimeout(this.__bindedStep);
        } else {
            setTimeout(this.__bindedStep, 0);
        }
        //setTimeout(this.__bindedStep, 0);
        //setTimeout("SGF.Game.current.step()", 0); <- Appears to be the same speed
    },

    /*
     * Stops the game loop if the game is running.
     **/
    stop: function() {
        this.listeners.stopping.invoke("call", this);
        this.running = false;
        return this;
    },

    stopped: function() {
        if (SGF.Input.grabbed) SGF.Input.release();
        SGF.Screen.useNativeCursor(true);
        SGF.Game.current = null;
        this.listeners.stopped.invoke("call", this);
    },

    /**
     * SGF.Game#update() -> undefined
     * The update function for the game loop. Calls [[SGF.Component#update]]
     * on all components added through [[SGF.Game#addComponent]]. Afterwards,
     * increments the [[SGF.Game#updateCount]] value by 1. Game code should
     * never have to call this method, however.
     **/
    update: function() {
        for (var i=0; i<this.components.length; i++) {
            if (this.components[i].update)
                this.components[i].update(this.updateCount);
        }
        this.updateCount++;
        this.upsCount++;
    },

    /* HTML/DOM Client specific function
     * Computes the z-index of a component added through addComponent.
     **/
    __computeChildZIndex: function(zIndex) {
        return ((parseInt(zIndex)||0)+1) * 1000;
    }
});

// PUBLIC STATIC
Object.extend(SGF.Game, {
    /* HTML/DOM Client specific object
     * The default options to use when no user provided one is given.
     **/
    DEFAULTS: {
        autostart: true,    // Start the game immediately after 'main.js' loads.
        gameSpeed: 30,      // The target UPS to achieve. Value is in milliseconds.
        maxFrameSkips: 5    // The maximum allowed number of updates to call in between render calls if hardware requires
    },

    /**
     * SGF.Game.current -> SGF.Game
     * 
     * The currently running game, or `null` if there is none running. This global
     * reference is how to access your [[SGF.Game]] object inside your game code.
     **/
    current: null,

    /* HTML/DOM Client specific function
     * Loads an entirely new game based on its root URL (the URL to the
     * folder where "main.js" resides), and sets the new instance to
     * SGF.Game.current
     */
    load: function(rootUrl, options) {
        // Stop the previous game if there is already one running.
        if (SGF.Game.current != null)
            SGF.Game.current.stop();

        // Create and set the new SGF.Game instance
        return new SGF.Game(rootUrl, options);
    }
});
