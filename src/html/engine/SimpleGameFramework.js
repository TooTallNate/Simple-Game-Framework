
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

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
        debugMode = "debug" in params ? params.debug === "true" : false,
        htmlMediaReady = false,
        engineScripts = {
            "Game":     null,
            "Screen":   null,
            "Input":    null,
            "Server":   null,
            "Client":   null,
            "Font":     null,
            "Component":null,
            "Audio":    null,
            "Container":null,
            "DumbContainer":null,
            "Label":    null,
            "Spriteset":null,
            "Sprite":   null,
            "Shape":    null,
            "Rectangle":null,
            "Circle":   null
        },
        eventListeners = {
            "load" : []
        },
        useZeroTimeout = "fastRendering" in params ? params.fastRendering === "true" : false,
        zeroTimeout = (function() {
            if (!window.addEventListener || !window.postMessage) return null;
            
            var timeouts = [];
            var messageName = "zero-timeout-message";

            function setZeroTimeout(fn) {
                timeouts.push(fn);
                window.postMessage(messageName, "*");
            }
    
            function handleMessage(event) {
                if (event.source == window && event.data == messageName) {
                    event.stopPropagation();
                    if (timeouts.length > 0) {
                        var fn = timeouts.shift();
                        fn();
                    }
                }
            }

            window.addEventListener("message", handleMessage, true);
            return setZeroTimeout;
        })();
        
    // The zeroTimeout is an event workaround that places a function in the
    // event queue and will execute sooner than setTimeout(fn, 0) would.
    if (zeroTimeout) {
        zeroTimeout(function() {
            SGF.zeroTimeout = zeroTimeout;
        });
    }
    
    // Engine Initialization, first all libraries are loaded. After all
    // dependencies are detected, the engine script files will load.
        // Load Prototype
    loadLibPrototype(function() {
        loadElementSetStyleImportant();
        loadElementSetRotation();
    });
        // Load Flash WebSocket fallback (if needed)
    if (!window.WebSocket) {
        log("Native WebSocket implementation not detected, loading Flash fallback:");
        loadSWFObject(function() {
            //loadHtmlMedia();
            loadFABridge(function() {
                loadWebSockets();
            });
        });
    } else {
        log("Native WebSocket implementation detected ☺");
    }










    
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

        log("SGF HTML/DOM engine loaded! Invoking 'load' listeners ☺");

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
        // We loop through, looking for a script that hasn't been loaded yet.
        var engineFinishedLoading = true, shortName;
        for (var script in engineScripts) {
            if (engineScripts[script] == this) shortName = script;
            if (!engineScripts[script].loaded) {
                engineFinishedLoading = false;
                break;
            }
        }
        
        log("\tEngine script loaded: " + shortName);

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
        if (typeof Prototype === 'object' && // Check for Prototype
            "WebSocket" in window && // Check for WebSockets (native or Flash)
            htmlMediaReady === false) { // Ensure the 'HtmlMedia' library is ready
            
            // Horray! All library files are loaded!
            
            // Now load all core engine scripts
            for (var script in engineScripts) {
                log("Loading engine script: " + script);
                engineScripts[script] = loadEngineScript(script);
            }
        }
    }
    
    /* The DOM nodes that SGF manipulates are always modified through
     * JavaScript, but just setting style.blah won't overwrite !important
     * in CSS style sheets. In order to compensate, all style changes must
     * be ensured that they use !important as well
     **/
    function loadElementSetStyleImportant() {
        Element.addMethods({
            setStyleI: (function(){ 
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

        if(window.CSSMatrix) transform = function(element, transform){
            element.style.transform = 'rotate('+(transform||0)+'rad)';
            return element;
        };
        else if(window.WebKitCSSMatrix) transform = function(element, transform){
            element.style.webkitTransform = 'rotate('+(transform||0)+'rad)';
            return element;
        };
        else if(Prototype.Browser.Gecko) transform = function(element, transform){
            element.style.MozTransform = 'rotate('+(transform||0)+'rad)';
            return element;
        };
        else if(Prototype.Browser.IE) transform = function(element, transform){
            if(!element._oDims)
                element._oDims = [element.offsetWidth, element.offsetHeight];
            var c = Math.cos(transform||0) * 1, s = Math.sin(transform||0) * 1;
            
            try {
                var matrix = element.filters("DXImageTransform.Microsoft.Matrix");
                //matrix.sizingMethod = "auto expand";
                matrix.M11 = c;
                matrix.M21 = -s;
                matrix.M12 = s;
                matrix.M22 = c;
            } catch (ex) {
                element.style.filter += " progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand',M11="+c+",M12="+(-s)+",M21="+s+",M22="+c+")";
            }
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
            log("Loading Prototype");
            loadLib("Prototype" in params ? params.Prototype : engineRoot + "lib/prototype.js", onComplete);
        } else {
            log("Prototype is already loaded, skipping...");
            libraryFileLoaded();
            onComplete();
        }
    }
    
    function loadHtmlMedia() {
        loadLib(engineRoot + "lib/HtmlMedia.js?path="+engineRoot+"lib&onready=_HtmlMediaReady", e);
    }
    
    
    window._HtmlMediaReady = function() {
        console.log("HtmlMedia is ready!");
        htmlMediaReady = true;
        libraryFileLoaded();
        delete window._HtmlMediaReady;
    };
    
    function loadSWFObject(onComplete) {
        if (!(window.swfobject && Object.isFunction(swfobject.embedSWF))) {
            log("\tLoading SWFObject 2.0");
            loadLib("SWFObject" in params ? params.SWFObject : engineRoot + "lib/swfobject.js", onComplete);
        } else {
            log("\tSWFObject 2.0 is already loaded, skipping...");
            libraryFileLoaded();
            onComplete();
        }
    }

    function loadFABridge(onComplete) {
        if (!window.FABridge) {
            log("\tLoading FABridge");
            loadLib(engineRoot + "lib/FABridge.js", onComplete);
        } else {
            log("\tFABridge is already loaded, skipping...");
            libraryFileLoaded();
            onComplete();
        }
    }

    function loadWebSockets() {
        log("\tLoading Flash WebSocket");
        loadScript(engineRoot + "lib/web_socket.js", function() {
            (function() {
                var body = document.getElementsByTagName("body");
                if (body.length >= 1) {
                    WebSocket.__swfLocation = engineRoot + "lib/WebSocketMain.swf";
                    WebSocket.__initialize();
                    libraryFileLoaded();

                } else {
                    setTimeout(arguments.callee, 10);
                }
            })();
        });
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
        if (debugMode && window.console && window.console.log) {
            window.console.log(((new Date).getTime()) + ": " + String(arguments[0]));
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

    function setDebugMode(bool) {
        if (Object.isBoolean(bool)) {
            debugMode = bool;
        } else {
            throw "SGF.setDebugMode: '" + bool + "' must be a Boolean!";
        }
    }

    var rtn = {
        log:        log,
        params:     params,
        observe:    observe,
        loadScript: loadScript,
        engineRoot: engineRoot,
        setDebugMode: setDebugMode,
        useZeroTimeout: useZeroTimeout
    };
    return rtn;
})();
