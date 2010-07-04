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
     /*
    self['addComponent'] = function(component) {
        var currentParent = component['parent'];
        if (currentParent !== self) {
            if (currentParent)
                currentParent['removeComponent'](component);
            components.push(component);
            self['screen']['element']['insert'](component);
            component['parent'] = self;
            component['__fixZIndex']();
        }
        return self;
    }
    */

    /**
     * SGF.Game#removeComponent(component) -> SGF.Game
     * - component (SGF.Component): The top-level component to remove from the
     *                              game loop and stop rendering.
     *                              
     * Removes a [[SGF.Component]] that has previously been added to the game
     * loop via [[SGF.Game#addComponent]].
     **/
     /*
    self['removeComponent'] = function(component) {
        var index = components.indexOf(component);
        if (index > -1) {
            arrayRemove(components, index);
            component['toElement']()['remove']();
            component['parent'] = null;
        }
        return self;
    }
    */


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







    EventEmitter.call(self);
    
    Container.call(self, options);
    
    
    self['input'] = new Input(self);
    
    self['screen'] = new Screen(self);
    self['screen']['_bind'](screen);



    // 'root' is the path to the folder containing the Game's 'main.js' file.
    if (rootUrl['endsWith']("main.js")) rootUrl = rootUrl.substring(0, rootUrl.lastIndexOf("main.js"));
    self['root'] = rootUrl['endsWith']('/') ? rootUrl : rootUrl + '/';
    
    // Set the initial game speed. This can be changed during gameplay.
    self['setGameSpeed'](self['gameSpeed']);

    // Init some standard properties
    self['loaded'] = self['running'] = false;
    self['startTime'] = NaN;

    // Set as currentGame for Game.getInstance
    currentGame = self;

    // A binded 'step' function
    self['_s'] = function() {
        self['step']();
    }

    // Last step of initialization is to load the Game's 'main.js' file
    new Script(self, "main.js", function() {
        self['loaded'] = true;
        // Notify all the game's 'load' listeners
        self['emit']('load');
        self['start']();
    });
}

inherits(Game, Container);
makePrototypeClassCompatible(Game);

/**
 * Game#gameSpeed -> Number
 *  
 * The current target updates per seconds the game is attepting to achieve.
 * This is meant to be read-only. If you must dynamically change the game
 * speed, use [[Game#setGameSpeed]] instead.
 *  
 * The default game speed attempted is 30 (thirty) updates per second.
 */
Game.prototype['gameSpeed'] = 30;

/**
 * Game#maxFrameSkips -> Number
 *  
 * The maximum allowed number of updates to call in between render calls
 * if the game's demand is more than current harware is capable of.
 * 
 * The default value is 5 (five).
 */
Game.prototype['maxFrameSkips'] = 5;

/**
 * Game#renderCount -> Number
 *
 * The total number of times that [[Game#render]] has been called
 * throughout the lifetime of the game.
 **/
Game.prototype['renderCount'] = 0;
 
 /**
  * Game#updateCount -> Number
  *
  * The total number of times that [[Game#update]] has been called
  * throughout the lifetime of the game.
  **/
Game.prototype['updateCount'] = 0;




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

    // The 'running' flag is used by step() to determine if the loop should
    // continue or end. No not set directly, use stop() to kill game loop.
    this['running'] = true;

    runningGameInstances.push(this);

    // Note when the game started, and when the next
    // call to update() should take place.
    this['startTime'] = this['nextGamePeriod'] = now();
    this['updateCount'] = this['renderCount'] = 0;

    // Start the game loop itself!
    setTimeout(this['_s'], 0);

    // Notify game's 'start' listeners
    this['emit']("start");
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
Game.prototype['render'] = function() {
    for (var i=0, component=null, renderCount = this['renderCount']++; i<this['components'].length; i++) {
        component = this['components'][i];
        if (component['render']) {
            component['render'](renderCount);
        }
    }
}


/*
 * The main iterator function. Called as fast as the browser can handle
 * (i.e. setTimeout(this.step, 0)) in order to implement variable FPS.
 * This method, however, ensures that update() is called at the requested
 * "gameSpeed", so long as hardware is capable.
 **/
Game.prototype['step'] = function() {
    // Stop the loop if the 'running' flag is changed.
    if (!this['running']) return this['stopped']();

    currentGame = this;

    // This while loop calls update() as many times as required depending
    // on the current time and the last time update() was called. This
    // could happen 0 times if the hardware is calling step() more times
    // than the requested 'gameSpeed'. This will result in higher FPS than UPS
    var loops = 0;
    while (now() > this['nextGamePeriod'] && loops < this['maxFrameSkips']) {
        this['update']();
        this['nextGamePeriod'] += this['period'];
        loops++;
    }

    // Sets the screen background color, screen width and height
    this['screen']['_r']();

    // Renders all game components, taking the interpolation value
    // to predict where the game objects will be placed.
    this['render']();

    // Continue the game loop, as soon as the browser has time for it,
    // allowing for other JS on the stack to be executed (events, etc.)
    setTimeout(this['_s'], 0);
}

/*
 * Stops the game loop if the game is running.
 **/
Game.prototype['stop'] = function() {
    this['emit']("stopping");
    this['running'] = false;
    return this;
}

Game.prototype['stopped'] = function() {
    this['screen']['useNativeCursor'](true);
    currentGame = null;
    this['emit']("stopped");
}

/**
 * SGF.Game#update() -> undefined
 * The update function for the game loop. Calls [[SGF.Component#update]]
 * on all components added through [[SGF.Game#addComponent]]. Afterwards,
 * increments the [[SGF.Game#updateCount]] value by 1. Game code should
 * never have to call this method, however.
 **/
Game.prototype['update'] = function() {
    for (var i=0, component=null, updateCount=this['updateCount']++; i < this['components'].length; i++) {
        component = this['components'][i];
        if (component['update']) {
            component['update'](updateCount);
        }
    }
}

/* HTML/DOM Client specific function
 * Computes the z-index of a component added through addComponent.
 **/
Game.prototype['__computeChildZIndex'] = function(zIndex) {
    return ((parseInt(zIndex)||0)+1) * 1000;
}

/**
 * Game#toString -> String
 *
 * String representation of the `Game` class.
 **/
Game.prototype['toString'] = functionReturnString("[object Game]");

/**
 * Game.getInstance() -> Game
 *
 * Gets the `Game` instance for your game.
 **/
Game['getInstance'] = function() {
    return currentGame;
}

modules['game'] = Game;
