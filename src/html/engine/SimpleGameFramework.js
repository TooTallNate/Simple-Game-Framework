 /**
  * == Core API ==
  * The lowest level functions and classes, often requiring the use of the
  * JavaScript implementor to use native code.  The Core API contains object
  * oriented drawing classes, sound management and input hooks.
  **/

/** section: Core API
 * SGF
 * The main namespace. All SGF related objects are placed directly in here,
 * purely for organization. It is recommended that games developed use their
 * own namespace, or find some other way of minimizing pollution to the global
 * namespace.
 **/
var SGF = (function() {
    var fileRegexp = /SimpleGameFramework\.js(\?.*)?$/,
        scriptNode = findScriptNode(),
        engineRoot = getEngineRoot(scriptNode),
        params = getScriptParams(scriptNode),
        engineScripts = {
            "Game":     null,
            "Screen":   null,
            "Input":    null,
            "Component":null,
            "Spriteset":null,
            "Sprite":   null,
            "Layer":    null,
            "Rectangle":null,
            "Circle":   null
        },
        eventListeners = {
            "load" : []
        };


    // Engine Initialization

    // The first matter of buisiness is to load all libraray files (Prototype,
    // Scripty2, SoundManager, etc.) if they need to be.

    loadLibPrototype(function() {
        loadLibScripty(function() {});
    });
    // TODO: loadSoundManager();









    /*
     * Expects a <script> node reference, and removes it from the DOM, and
     * destroys the object in a memory leak free manner.
     **/
    function destroyScript(script) {
        // If it's somewhere in the DOM, remove it!
        if (script.parentNode)
            script.parentNode.removeChild(script);
        // Now remove all properties on the object
        for (var prop in script)
          delete script[prop];
        return script;
    }

    /*
     * Empty function
     **/
    function e() {}

    /*
     * Called by engineScriptLoaded once ALL required engine scripts have
     * finished loading. This method notifies all "load" observers that the
     * engine is loaded and ready to load a game.
     **/
    function engineLoaded() {
        // Set the 'loaded' flag to 'true'
        SGF.loaded = true;

        // Notify all the 'load' listeners.
        eventListeners.load.invoke("call", SGF);

        // If the webpage supplied a 'game' param to the script node, then
        // now is the time to load it! This is a way to auto-load a game.
        if ("game" in params)
            SGF.Game.load(params.game);

        // This is the end if initialization. If no 'game' param was supplied
        // then the webpage must call SGF.Game.load(gameRootUrl) to start a game.
    }

    /*
     * Called by a Script node's onload event from a required engine script.
     * This method checks to see if every script has loaded at this point,
     * and if so calls engineLoaded(). This method is called as many times
     * as there are required scripts, but engineLoaded() will only be called
     * once, and at the end.
     **/
    function engineScriptLoaded(loadEvent) {
        //console.log(loadEvent.target.src + " finished loading!");
        
        var engineFinishedLoading = true;
        for (var script in engineScripts) {
            if (!engineScripts[script].loaded) {
                engineFinishedLoading = false;
                break;
            }
        }

        if (engineFinishedLoading) engineLoaded();
    }

    /*
     * Finds the script node that is executing this code.
     **/
    function findScriptNode() {
        var scriptNodes = document.getElementsByTagName("script"), i = 0;
        for (; i < scriptNodes.length; i++)
            if (scriptNodes[i].src.match(fileRegexp))
                return scriptNodes[i];
        return null;
    }

    /*
     * Returns the path to the root of the game engine. This
     * is the folder in which "SimpleGameFramework" resides.
     **/
    function getEngineRoot(script) {
        return script.src.replace(fileRegexp, '');
    }

    /*
     * Gets the query string found after the src in the script node,
     * and packages the items into an object for reusal.
     **/
    function getScriptParams(script) {
        var index = script.src.indexOf('?'), i=0, rtn = {};
        if (index > -1) {
            var p = script.src.substring(index+1).split('&'), cur;
            for (; i<p.length; i++) {
                cur = p[i].split('=');
                if (cur.length == 2) {
                    rtn[cur[0]] = cur[1];
                }
            }
        }
        return rtn;
    }

    /*
     * Called after each library file is loaded, or confirmed previously loaded.
     * The method checks if ALL libraries are loaded, and if they are, proceeds
     * to load the engine. Parsing parameters and then loading required engine
     * core scripts.
     **/
    function libraryFileLoaded() {
        if (typeof Prototype !== 'undefined' &&
            typeof S2 !== 'undefined') {
            // Horray! All library files are loaded!
            
            // Now load all core engine scripts
            for (var script in engineScripts) {
                console.log("Loading engine script: " + script);
                engineScripts[script] = loadEngineScript(script);
            }
        }
    }

    /*
     * Loads a required engine script file, automatically constructing the
     * absolute URL to use for the script. The parameter needs to be only the
     * single word that the script file is relevant to. engineScriptLoaded()
     * is called after the loaded engine script finishes loading.
     **/
    function loadEngineScript(scriptName) {
        return loadScript(engineRoot + "SGF." + scriptName + ".js", engineScriptLoaded);
    }

    function loadLib(scriptPath, onComplete) {
        var loaded = function() {
            libraryFileLoaded();
            onComplete();
        }
        loadScript(scriptPath, loaded);
    }

    /*
     * Checks for Prototype, and calls "onComplete" if it is already loaded.
     * If not, then this loads Prototype. The init parameter 'Prototype' can
     * override where Prototype is loaded from.
     **/
    function loadLibPrototype(onComplete) {
        if (typeof Prototype === 'undefined') {
            loadLib("Prototype" in params ? params.Prototype : engineRoot + "lib/prototype.js", onComplete);
        } else {
            libraryFileLoaded();
            onComplete();
        }
    }

    function loadLibScripty(onComplete) {
        if (typeof S2 === 'undefined') {
            loadLib("s2" in params ? params.s2 : engineRoot + "lib/s2.js", onComplete);
        } else {
            libraryFileLoaded();
            onComplete();
        }
    }

    /*
     * Dynamically load a script element, calling an optional callback function
     * when the script finishes loading.
     **/
    function loadScript(scriptUrl, onComplete) {
        // Replace onComplete with an empty function if none was given.
        onComplete = typeof onComplete === 'function' ? onComplete : e;

        // Create a new script element with the specified src
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.loaded = false;
        script.setAttribute("async", "true");

        script.onload = script.onreadystatechange = function() {
            if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
                script.loaded = true;
                onComplete.apply(this, arguments);
            }
        }

        script.src = scriptUrl;

        // Add the script element to the document head
        document.getElementsByTagName("head")[0].appendChild(script);

        // Return the script element
        return script;
    }

    /*
     * SGF.observe(eventName, handler) -> undefined
     * - eventName (String): One of the valid event names to attach a handler to.
     * - handler (Function): The function to call when the specified event occurs.
     *
     * Used to observe engine-specific events. This should rarely be used in your
     * games' code.
     **/
    function observe(eventName, handler) {
        if (!(eventName in eventListeners)) throw "'" + eventName + "' is an invalid eventName";
        if (typeof(handler) !== 'function') throw "func must be a Function."
        eventListeners[eventName].push(handler);
    }



    
    
    return {
        params:     params,
        observe:    observe,
        loadScript: loadScript
    };
})();

SGF.observe("load", function() {
    console.log("engine loaded");
});
