// Returns the current timestamp in milliseconds, opting
// for the native 'Date.now' function if available.
var now = (function() {
    if ("now" in Date) {
        return Date['now'];
    } else {
        return function() {
            return (new Date).getTime();
        };
    }
})(),
// A private variable containing the 'current' game. Used
// internally by `Game.getInstance()`.
currentGame = null,
// An private array of the currently running SGF games.
// More than 1 are able to be displayed on a single HTML
// page by calling `SGF.startWithDiv()` multiple times.
runningGameInstances = [];


/** section: Core API
 * class Game < Container
 *
 * Represents your game itself. That is, an instance of [[Game]] is
 * automatically created every time an SGF game is loaded. The
 * [[Game]] class is in charge of the "game loop", and invokes it's
 * own [[Game#update]] and [[Game#render]] functions to execute the
 * game.
 *
 * The [[Game]] class is a subclass of [[Container]], and will be the
 * top-level [[Container]] that you will be inserting custom [[Component]]
 * instances into.
 *  
 * [[Game]] is an [[EventEmitter]], which emits the following events:
 *
 *  - `load`: Fired immediately after the game's _main.js_ file finishes
 *            loading and executing into the game environment.
 *  
 *  - 'start': 
 *  
 *  - 'stopping':
 *  
 *  - 'stopped' :
 **/
function Game(rootUrl, screen, options) {

    var self = this;
    
    /**
     * Game#addComponent(component) -> Game
     * - component (Component): The top-level component to add to the game
     *                              loop and begin rendering.
     *                              
     * Adds a [[Component]] to the game. It will be rendered onto the screen,
     * and considered in the game loop. Returns the [[Game]] object (this),
     * for chaining.
     **/

    /**
     * Game#removeComponent(component) -> Game
     * - component (Component): The top-level component to remove from the
     *                              game loop and stop rendering.
     *                              
     * Removes a [[Component]] that has previously been added to the game
     * loop via [[Game#addComponent]].
     **/






    EventEmitter.call(self);
    
    Container.call(self, options);
    
    
    self['input'] = new Input(self);
    
    self['screen'] = new Screen(self);
    self['screen']['_bind'](screen);



    // 'root' is the path to the folder containing the Game's 'main.js' file.
    if (rootUrl['endsWith']("main.js")) rootUrl = rootUrl.substring(0, rootUrl.lastIndexOf("main.js"));
    
    /**
     * Game#root -> String
     *  
     * Read-only. The absolute path to the root directory (where `main.js`
     * resides) of the SGF game. Trailing slash is included.
     **/
    self['root'] = rootUrl['endsWith']('/') ? rootUrl : rootUrl + '/';
    
    // Set the initial game speed. This can be changed during gameplay.
    self['setGameSpeed'](self['gameSpeed']);

    // Init some standard properties
    self['running'] = false;
    self['startTime'] = NaN;

    // Set as currentGame for `Game.getInstance()`
    currentGame = self;

    // A binded 'step' function
    self['_s'] = function() {
        self['step']();
    }

    // Last step of initialization is to load the Game's 'main.js' file
    self['getScript']("main.js", function() {
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
 * Read-only. The current target updates-per-second the game is attepting
 * to achieve. If you must dynamically change the game speed during
 * runtime, use [[Game#setGameSpeed]] instead.
 *  
 * The default game speed attempted is **30** (thirty) updates per second.
 **/
Game.prototype['gameSpeed'] = 30;

/**
 * Game#loaded -> Boolean
 *  
 * Read-only. `false` immediately after instantiation. `true` once the
 * ___main.js___ file has finished loading and has been executed.
 **/
Game.prototype['loaded'] = false;

/**
 * Game#maxFrameSkips -> Number
 *  
 * Read and write. The maximum allowed number of times [[Game#update]] may
 * be called in between [[Game#render]] calls if the game's demand is more
 * than current harware is capable of.
 * 
 * The default value is **5** (five).
 **/
Game.prototype['maxFrameSkips'] = 5;

/**
 * Game#renderCount -> Number
 *
 * Read-only. The total number of times that [[Game#render]] has been
 * called throughout the lifetime of the game.
 **/
Game.prototype['renderCount'] = 0;
 
 /**
  * Game#updateCount -> Number
  *
  * Read-only. The total number of times that [[Game#update]] has been
  * called throughout the lifetime of the game.
  **/
Game.prototype['updateCount'] = 0;




/**
 * Game#setGameSpeed(updatesPerSecond) -> Game
 * - updatesPerSecond (Number): The number of updates-per-second the
 *                              game should attempt to achieve.
 *                              
 * Sets the "Game Speed", or attempted times [[Game#update]] gets called
 * per second. This can be called at any point during gameplay. Note that
 * sounds and music playback speed do not get affected by this value.
 **/
Game.prototype['setGameSpeed'] = function(updatesPerSecond) {
    this['gameSpeed'] = updatesPerSecond;

    // 'period' is the attempted time between each update() call (in ms).
    this['period'] = 1000 / updatesPerSecond;
    return this;
}

Game.prototype['start'] = function() {
    debug('Starting "' + this['root'] + '"');

    // The 'running' flag is used by step() to determine if the loop should
    // continue or end. Do not set directly, use stop() to kill game loop.
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

/**
 * Game#getFont(relativeUrl[, callback = null]) -> Font
 * - relativeUrl (String): A URL relative to the [[Game#root]] of a font
 *                         resource to load.
 * - callback (Function): Optional. A `Function` to invoke when the font
 *                        loading process has completed, successfully or
 *                        not. If an error occured (ex: file not found),
 *                        an `Error` object will be passed as the first
 *                        argument to `callback`.
 *                              
 * A convienience function that returns a `new` [[Font]], but forcing the
 * URL to be relative to [[Game#root]], instead of the default.
 **/
Game.prototype['getFont'] = function(relativeUrl, callback) {
    return new modules['font'](this, relativeUrl, callback);
}

/**
 * Game#getScript(relativeUrl[, callback = null]) -> Script
 * - relativeUrl (String): A URL relative to the [[Game#root]] of a
 *                         JavaScript source file to load.
 * - callback (Function): Optional. A `Function` to invoke when the script
 *                        loading and executing process has completed,
 *                        successfully or not. If an error occured (ex:
 *                        file not found), an `Error` object will be passed
 *                        as the first argument to `callback`.
 *                              
 * A convienience function that returns a `new` [[Script]], but forcing the
 * URL to be relative to [[Game#root]], instead of the default.
 **/
Game.prototype['getScript'] = function(relativeUrl, callback) {
    return new modules['script'](this, relativeUrl, callback);
}

/**
 * Game#getSound(relativeUrl[, callback = null]) -> Sound
 * - relativeUrl (String): A URL relative to the [[Game#root]] of sound
 *                         file to load.
 * - callback (Function): Optional. A `Function` to invoke when the sound
 *                        loading process has completed, successfully or
 *                        not. If an error occured (ex: file not found),
 *                        an `Error` object will be passed as the first
 *                        argument to `callback`.
 *                              
 * A convienience function that returns a `new` [[Sound]], but forcing the
 * URL to be relative to [[Game#root]], instead of the default.
 **/
Game.prototype['getSound'] = function(relativeUrl, callback) {
    return new modules['sound'](this, relativeUrl, callback);
}

/**
 * Game#getSpriteset(relativeUrl[, callback = null]) -> Spriteset
 * - relativeUrl (String): A URL relative to the [[Game#root]] of an
 *                         image resource to load.
 * - callback (Function): Optional. A `Function` to invoke when the image
 *                        loading process has completed, successfully or
 *                        not. If an error occured (ex: file not found),
 *                        an `Error` object will be passed as the first
 *                        argument to `callback`.
 *                              
 * A convienience function that returns a `new` [[Spriteset]], but forcing the
 * URL to be relative to [[Game#root]], instead of the default.
 **/
Game.prototype['getSpriteset'] = function(relativeUrl, width, height, callback) {
    return new modules['spriteset'](this, relativeUrl, width, height, callback);
}

/**
 * Game#render() -> undefined
 *                           
 * The game render function that gets called automatically during each pass
 * in the game loop. Calls [[Component#render]] on all components added
 * through [[Container#addComponent]]. Afterwards, increments the
 * [[Game#renderCount]] value by _1_.
 * 
 * SGF game code should never have to call this method, it is handled
 * automatically by the game loop.
 **/
Game.prototype['render'] = function() {
    for (var components = arrayClone(this['components']),
            i=0,
            component=null,
            renderCount = this['renderCount']++,
            length = components.length; i<length; i++) {
        
        component = components[i];
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

    // Renders all game components.
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
 * Game#update() -> undefined
 *                           
 * The game update function that gets called automatically during each pass
 * in the game loop. Calls [[Component#update]] on all components added
 * through [[Container#addComponent]]. Afterwards, increments the
 * [[Game#updateCount]] value by _1_.
 * 
 * SGF game code should never have to call this method, it is handled
 * automatically by the game loop.
 **/
Game.prototype['update'] = function() {
    for (var components = arrayClone(this['components']),
            i=0,
            component=null,
            updateCount=this['updateCount']++,
            length = components.length; i < length; i++) {
        
        component = components[i];
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

Game.prototype['toString'] = functionReturnString("[object Game]");

/**
 * Game.getInstance() -> Game
 *
 * Gets the `Game` instance for your game. This will likely be one
 * of the first lines of code in your SGF game's `main.js` file.
 **/
Game['getInstance'] = function() {
    return currentGame;
}

modules['game'] = Game;
