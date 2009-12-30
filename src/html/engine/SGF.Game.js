
SGF.Game = Class.create({
    initialize: function(rootUrl, options) {
        // 'root' is the path to the folder containing the Game's 'main.js' file.
        this.root = rootUrl.endsWith('/') ? rootUrl : rootUrl + '/';
        
        // Override the default options with the user defined options
        this.setOptions(options);

        // 'period' is the attempted time between each update() call (in ms).
        this.period = 1000 / this.options.gameSpeed;

        // Init some standard properties
        this.loaded = this.running = false;
        this.startTime = -1;
        this.components = [];

        // Keep a "private" reference to a binded 'step' function, for use in
        // the game loop (setTimeout looses the 'this' reference normally).
        this.__bindedStep = this.step.bind(this);

        // Last step of initialization is to load the Game's 'main.js' file
        this.loadScript("main.js", this.mainFileLoaded.bind(this));
    },

    /**
     * Stops the game loop if the game is running.
     **/
    kill: function() {
        this.running = false;
        return this;
    },

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

    now: function() {
        return new Date().getTime();
    },

    recordStats: function() {
        //this.statsInterval += this.period;

        //if (this.statsInterval >= this.options.statsInterval) {
            var now = this.now(), totalDuration = now-this.startTime;

            $("fps").update(((this.renderCount/totalDuration)*1000).toFixed(2));
            $("ups").update(((this.updateCount/totalDuration)*1000).toFixed(2));
            $("timeInGame").update((totalDuration/1000).toFixed(2));

        //    this.statsInterval = 0;
        //}
    },

    render: function(interpolation) {
        this.renderCount++;
        for (var i=0; i < this.components.length; i++) {
            this.components[i].render(interpolation, this.renderCount);
        }
    },

    start: function() {
        console.log("Starting " + this.root);

        // The 'running' flag is used by step() to determine if the loop
        // should continue or end. Set to 'false' to stop the game loop.
        this.running = true;

        // Note when the game started, and when the next
        // call to update() should take place.
        this.startTime = this.nextGamePeriod = this.now();
        this.updateCount = this.renderCount = 0;

        // Start the game loop itself!
        setTimeout(this.__bindedStep, 0);

        // DEBUG!! Display stats every second
        setInterval(this.recordStats.bind(this), 1000);
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
        // the predict where the game objects will be placed.
        this.render(interpolation);

        setTimeout(this.__bindedStep, 0);
    },

    update: function() {
        this.updateCount++;
        for (var i=0; i<this.components.length; i++) {
            this.components[i].update(this.updateCount);
        }
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
        SGF.Game.current = new SGF.Game(rootUrl, options);
        return SGF.Game.current;
    }
});


// timer: a function that calls setTimeout to the specified number of ms,
// and reports an error percentage when it completes based on its actual
// completion time. I don't know why I'm keeping it... just in case I guess.
//
//function timer(ms) {
//  var startTime = new Date().getTime();
//  setTimeout(function() {
//    var endTime = new Date().getTime();
//    var diff = endTime - startTime;
//    var err = ((ms - diff)/diff )*100;
//    alert("Sleep for: " + ms + "ms, actual: " + diff + "ms, err: " + err + "%");
//  }, ms);
//}