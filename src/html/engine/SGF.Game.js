
SGF.Game = Class.create({
    initialize: function(rootUrl, options) {
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
        this.__bindedStep = this.step.bind(this);

        // Last step of initialization is to load the Game's 'main.js' file
        this.loadScript("main.js", this.mainFileLoaded.bind(this));
    },

    /**
     * Adds a top level component to the game. A top level component is expected
     * to both update() and render(). And will be placed into the currently
     * binded SGF.Screen element.
     **/
    addComponent: function(component) {
        if (!this.components.include(component)) {
            this.components.push(component);
            SGF.Screen.element.insert(component);
        }
    },

    /**
     * Loads a script file in the game's folder. The script is immediately
     * executed once it has finished loading. Afterwards, the optional
     * 'onComplete' function is called.
     **/
    loadScript: function(relativeUrl, onComplete) {
        return SGF.loadScript(this.root + relativeUrl,
            Object.isFunction(onComplete) ? onComplete : Prototype.emptyFunction);
    },

    mainFileLoaded: function() {
        this.loaded = true;
        if (this.options.autostart === true) {
            this.start();
        }
    },

    observe: function(eventName, handler) {
        
    },

    /**
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
     * The regular render loop. Calls render() on all components added through
     * SGF.Game#addComponent(). Afterwards updates the count of total render()
     * calls for statistics.
     **/
    render: function(interpolation) {
        for (var i=0; i < this.components.length; i++) {
            this.components[i].render(interpolation, this.renderCount);
        }
        this.renderCount++;
        this.fpsCount++;
    },

    /**
     * Sets the "Game Speed", or attempted times update() gets called per
     * second. This can be called during gameplay. Note that playing sounds
     * and music do not get affected by this value.
     */
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

    /**
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

        // The interpolation value describes where in between update() calls
        // this render() call is taking place.
        var interpolation = (this.now() + this.period - this.nextGamePeriod)
                                                / this.period;
        // Renders all game components, taking the interpolation value
        // to predict where the game objects will be placed.
        this.render(interpolation);

        // Continue the game loop, as soon as the browser has time for it.
        setTimeout(this.__bindedStep, 0);
    },

    /**
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
     * The regular update loop. Calls update() on all components added through
     * SGF.Game#addComponent(). Afterwards updates the count of total update()
     * calls for statistics.
     **/
    update: function() {
        for (var i=0; i<this.components.length; i++) {
            this.components[i].update(this.updateCount);
        }
        this.updateCount++;
        this.upsCount++;
    }

}, S2.UI.Mixin.Configurable);


// PUBLIC STATIC
Object.extend(SGF.Game, {
    /**
     * The default options to use when no user provided one is given.
     * This is used by S2.UI.Mixin.Configurable#setOptions(options).
     **/
    DEFAULT_OPTIONS: {
        autostart: true,    // Start the game immediately after 'main.js' loads.
        gameSpeed: 30,      // The target UPS to achieve. Value is in milliseconds.
        maxFrameSkips: 5    // The maximum allowed number of updates to call in between render calls if hardware requires
    },

    /**
     * The currently running game, or null if there is none running.
     * Value is (re)set with SGF.Game.load().
     */
    current: null,

    /**
     * Loads an entirely new game based on its root URL (the URL to the
     * folder where "main.js" resides).
     */
    load: function(rootUrl, options) {
        // Stop the previous game if there is already one running.
        if (SGF.Game.current != null)
            SGF.Game.current.stop();

        // Create and set the new SGG.Game instance
        SGF.Game.current = new SGF.Game(rootUrl, options);
        return SGF.Game.current;
    }
});
