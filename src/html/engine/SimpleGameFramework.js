/**
 * == Core API ==
 * The lowest level functions and classes. The Core API contains objects
 * automatically generated when the engine and game are loaded.
 **/

/** section: Core API
 * SGF
 * The main namespace. All SGF related objects are placed directly in here,
 * purely for organization. It is recommended that games developed use their
 * own namespace, or find some other way of minimizing pollution to the global
 * namespace.
 **/
var SGF = (function() {
    // Define private vars.
    var fileRegexp = /SimpleGameFramework\.js(\?.*)?$/,
        scriptNode = findScriptNode(),
        engineRoot = getEngineRoot(scriptNode),
        params = getScriptParams(scriptNode),
        engineScripts = {
            "Game":     null,
            "Screen":   null,
            "Input":    null,
            "Component":null,
            "Container":null,
            "Spriteset":null,
            "Sprite":   null,
            "Shape":    null,
            "Rectangle":null,
            "Circle":   null
        },
        eventListeners = {
            "load" : []
        };


    // Engine Initialization

    // The first matter of buisiness is to load all libraray files (Prototype,
    // SoundManager, etc.) if they need to be.
    loadLibPrototype(function() {
        loadElementSetRotation();
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
     * Empty function, assuming Prototype hasn't loaded yet.
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
        //SGF.log(loadEvent.target.src + " finished loading!");

        // We loop through, looking for a script that hasn't been loaded yet.
        var engineFinishedLoading = true;
        for (var script in engineScripts) {
            if (!engineScripts[script].loaded) {
                engineFinishedLoading = false;
                break;
            }
        }

        // But if the loop finishes and the flag is still true, call 'engineLoaded'
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
        if (typeof Prototype !== 'undefined') {
            // Horray! All library files are loaded!
            
            // Now load all core engine scripts
            for (var script in engineScripts) {
                log("Loading engine script: " + script);
                engineScripts[script] = loadEngineScript(script);
            }
        }
    }

    /*
     * This loads Element#setRotation, which is a variation of Element#transform
     * from Scripty2, but with the scale hard-coded at 1, and rotation being the
     * only affected value.
     **/
    function loadElementSetRotation() {
        var transform;

        if(window.CSSMatrix) transform = function(element, transform){
            element.style.transform = 'scale(1) rotate('+(transform||0)+'rad)';
            return element;
        };
        else if(window.WebKitCSSMatrix) transform = function(element, transform){
            element.style.webkitTransform = 'scale(1) rotate('+(transform||0)+'rad)';
            return element;
        };
        else if(Prototype.Browser.Gecko) transform = function(element, transform){
            element.style.MozTransform = 'scale(1) rotate('+(transform||0)+'rad)';
            return element;
        };
        else if(Prototype.Browser.IE) transform = function(element, transform){
            if(!element._oDims)
                element._oDims = [element.offsetWidth, element.offsetHeight];
            var c = Math.cos(transform||0) * 1, s = Math.sin(transform||0) * 1,
                filter = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand',M11="+c+",M12="+(-s)+",M21="+s+",M22="+c+")";
            element.style.filter = filter;
            element.style.marginLeft = (element._oDims[0]-element.offsetWidth)/2+'px';
            element.style.marginTop = (element._oDims[1]-element.offsetHeight)/2+'px';
            return element;
        };
        else transform = function(element){ return element; }

        Element.addMethods({ setRotation: transform });
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

    /*
     * Checks for Scripty2, and calls "onComplete" if it is already loaded.
     * If not, then this loads it. The init parameter 's2' can
     * override where Scripty2 is loaded from.
    function loadLibScripty(onComplete) {
        if (typeof S2 === 'undefined') {
            loadLib("s2" in params ? params.s2 : engineRoot + "lib/s2.js", onComplete);
        } else {
            libraryFileLoaded();
            onComplete();
        }
    }
    **/

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

    /**
     * SGF.log(arg) -> undefined
     * SGF.log(arg...) -> undefined
     * - arg (Object): An arbitrary number of `Object`s to write to the debug
     *                 console.
     *
     * A simple `log` statement for debugging. You can pass any number of
     * objects to inspect to this function. The value output will be the result
     * of Prototype's `Object.inspect()` on the object(s) being logged. Where
     * exactly the output of this function goes is platform specific. In the
     * HTML client, output goes to the `console` object via `console.log`. In
     * the Java client, output is sent to `System.out.println`, etc.
     **/
    function log() {
        if (window.console && window.console.log) {
            for (var i=0; i<arguments.length; i++) {
                window.console.log((new Date().getTime()) + ": " +
                    (Object.inspect ? Object.inspect(arguments[i]) : String(arguments[i])));
            }
        }
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
        log:        log,
        params:     params,
        observe:    observe,
        loadScript: loadScript,
        engineRoot: engineRoot
    };
})();

//SGF.observe("load", function() {
//    console.log("engine loaded");
//});
