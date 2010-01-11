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
 * The total number of times that [[SGF.Game#update]] has been called for this
 * game.
 **/

/**
 * SGF.Game#renderCount -> Number
 *
 * The total number of times that [[SGF.Game#render]] has been called for this
 * game.
 **/

SGF.Game = Class.create({
    initialize: function(rootUrl, options) {
        SGF.Game.current = this;

        // 'root' is the path to the folder containing the Game's 'main.js' file.
        this.root = rootUrl.endsWith('/') ? rootUrl : rootUrl + '/';
        
        // Override the default options with the user defined options
        this.setOptions(options);

        // Set the initial game speed. This can be changed during gameplay.
        this.setGameSpeed(this.options.gameSpeed);

        // Init some standard properties
        this.loaded = this.running = false;
        this.startTime = -1;
        this.components = [];
        this.listeners = {
            "load": [],
            "start": [],
            "stopping": [],
            "stopped": []
        }

        // Keep a "private" reference to a binded 'step' function, for use in
        // the game loop (setTimeout looses the 'this' reference normally).
        //this.__bindedStep = this.step.bind(this);
        var This = this;
        this.__bindedStep = function() {
            return This.step();
        }

        // Last step of initialization is to load the Game's 'main.js' file
        this.loadScript("main.js", this.mainFileLoaded.bind(this));
    },

    /**
     * SGF.Game#addComponent(component) -> SGF.Game
     * - component (SGF.Component): The top-level component to add to the game
     *                              loop and begin rendering.
     *                              
     * Adds a top-level component to the game. A top-level component is expected
     * to both update() and render(). It will be placed onto the drawing screen,
     * and considered in the game loop. Returns the [[SGF.Game]] object (this),
     * for chaining.
     **/
    addComponent: function(component) {
        if (!this.components.include(component)) {
            this.components.push(component);
            SGF.Screen.element.insert(component);
        }
        return this;
    },

    /**
     * SGF.Game#removeComponent(component) -> SGF.Game
     * - component (SGF.Component): The top-level component to remove from the
     *                              game loop and stop rendering.
     *                              
     * Removes a SGF.Component that has been added to the game loop via
     * [[SGF.Game#addComponent]].
     **/
    removeComponent: function(component) {
        if (this.components.include(component)) {
            this.components = this.components.without(component);
            component.toElement().remove();
        }
        return this;
    },

    /**
     * SGF.Game#loadScript(filePath, onLoad) -> SGF.Game
     * - filePath (String): The relative path, including filename of the game
     *                      script file to load.
     * - onLoad (Function): The Function to invoke when the script file
     *                      has finished loading and executing.
     *                      
     * Loads a script file in the game's folder. The script is immediately
     * executed once it has finished loading. Afterwards, the optional
     * [[onLoad]] function is called.
     **/
    loadScript: function(relativeUrl, onComplete) {
        SGF.loadScript(this.root + relativeUrl,
            Object.isFunction(onComplete) ? onComplete.bind(SGF.Game.current) : Prototype.emptyFunction);
        return this;
    },

    mainFileLoaded: function() {
        this.loaded = true;
        if (this.options.autostart === true) {
            this.start();
        }
    },

    observe: function(eventName, handler) {
        
    },

    /*
     * Returns the current timestamp in milliseconds.
     * Used continually by the game loop.
     **/
    now: function() {
        return new Date().getTime();
    },

    recordStats: function() {
        var now = this.now(), totalDuration = now-this.statsTime;

        $("fps").update(((this.fpsCount/totalDuration)*1000).toFixed(2));
        $("ups").update(((this.upsCount/totalDuration)*1000).toFixed(2));
        $("timeInGame").update(((now-this.startTime)/1000).toFixed(2));

        this.fpsCount = this.upsCount = 0;
        this.statsTime = this.now();
    },

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
        this.options.gameSpeed = updatesPerSecond;

        // 'period' is the attempted time between each update() call (in ms).
        this.period = 1000 / this.options.gameSpeed;
    },

    start: function() {
        console.log("Starting " + this.root);

        if (!SGF.Input.grabbed) SGF.Input.grab();
        

        // The 'running' flag is used by step() to determine if the loop should
        // continue or end. No not set directly, use stop() to kill game loop.
        this.running = true;

        // Note when the game started, and when the next
        // call to update() should take place.
        this.startTime = this.nextGamePeriod = this.now();
        this.updateCount = this.renderCount = 0;
        
        // Start the game loop itself!
        setTimeout(this.__bindedStep, 0);



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
        if (!this.running) return;

        // This while loop calls update() as many times as required depending
        // on the current time and the last time update() was called. This
        // could happen 0 times if the hardware is calling step() more times
        // than the requested 'gameSpeed'. This will result in higher FPS than UPS
        var loops = 0;
        while (this.now() > this.nextGamePeriod && loops < this.options.maxFrameSkips) {
            this.update();
            this.nextGamePeriod += this.period;
            loops++;
        }

        // Sets the background color, only if it has changed in game code.
        SGF.Screen.resetColor();

        // The interpolation value describes where in between update() calls
        // this render() call is taking place.
        var interpolation = (this.now() + this.period - this.nextGamePeriod)
                                                / this.period;
        // Renders all game components, taking the interpolation value
        // to predict where the game objects will be placed.
        this.render(interpolation);

        // Continue the game loop, as soon as the browser has time for it,
        // allowing for other JS on the stack to be executed (events, etc.)
        setTimeout(this.__bindedStep, 0);
    },

    /*
     * Stops the game loop if the game is running.
     **/
    stop: function() {
        if (SGF.Input.grabbed) SGF.Input.release();
        SGF.Screen.showNativeCursor(true);

        this.running = false;

        SGF.Game.current = null;
        
        return this;
    },

    /**
     * SGF.Game#update() -> undefined
     * The update function for the game loop. Calls SGF.Component#update on all
     * components added through [[SGF.Game#addComponent]]. Afterwards, increments
     * the [[SGF.Game#updateCount]] value by 1. Game code should never have to call
     * this method, however.
     **/
    update: function() {
        for (var i=0; i<this.components.length; i++) {
            this.components[i].update(this.updateCount);
        }
        if (this.updateCount % this.options.gameSpeed == 0) {
            SGF.Screen.remeasure();
        }

        this.updateCount++;
        this.upsCount++;
    }

}, S2.UI.Mixin.Configurable);


// PUBLIC STATIC
Object.extend(SGF.Game, {
    /*
     * The default options to use when no user provided one is given.
     * This is used by S2.UI.Mixin.Configurable#setOptions(options).
     **/
    DEFAULT_OPTIONS: {
        autostart: true,    // Start the game immediately after 'main.js' loads.
        gameSpeed: 30,      // The target UPS to achieve. Value is in milliseconds.
        maxFrameSkips: 5    // The maximum allowed number of updates to call in between render calls if hardware requires
    },

    /**
     * SGF.Game.current -> SGF.Game
     * 
     * The currently running game, or [[null]] if there is none running. This global
     * reference is how to access your [[SGF.Game]] object inside your game code.
     **/
    current: null,

    /*
     * Loads an entirely new game based on its root URL (the URL to the
     * folder where "main.js" resides), and sets the new instance to
     * SGF.Game.current
     */
    load: function(rootUrl, options) {
        // Stop the previous game if there is already one running.
        if (SGF.Game.current != null)
            SGF.Game.current.stop();

        // Create and set the new SGG.Game instance
        new SGF.Game(rootUrl, options);
        return SGF.Game.current;
    }
});
