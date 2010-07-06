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
    
    // 'hasCanvas' and 'hasCanvasText' need to be true in order for the canvas
    // renderer to kick in, otherwise SGF will fall back to a DOM based
    // renderer. To force the DOM renderer on modern browsers, pass a
    // "data-force-dom" param to the SGF script.
    ,   hasCanvas = !!document.createElement( "canvas" ).getContext
    ,   hasCanvasText =  !!(hasCanvas && typeof document.createElement("canvas" ).getContext('2d').fillText == 'function')
    
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
        'fabridge':     'lib/FABridge.js',
        'soundjs':      'lib/Sound.min.js',
        'soundjs-swf':  'lib/Sound.swf',
        'websocket':    'lib/web_socket.js',
        'websocket-swf':'lib/WebSocketMain.swf'
    },

    // The current Date, so that we can measure how long it took to load SGF
    // and the dependant libraries.
    loadStartTime = new Date(),

    // "Modules" are the classes retrieved from calling SGF.require().
    modules = {},
    
    // browser sniffs
    userAgent = navigator.userAgent,
    isOpera = Object.prototype.toString.call(window['opera']) == '[object Opera]',
    isIE = !!window['attachEvent'] && !isOpera,
    isIE7orLower =  isIE && parseFloat(navigator.userAgent.split("MSIE")[1]) <= 7,
    isWebKit = userAgent.indexOf('AppleWebKit/') > -1,
    isGecko = userAgent.indexOf('Gecko') > -1 && userAgent.indexOf('KHTML') === -1,
    isMobileSafari = /Apple.*Mobile/.test(userAgent);




    /* The DOM nodes that SGF manipulates are always modified through
     * JavaScript, but just setting style.blah won't overwrite !important
     * in CSS style sheets. In order to compensate, all style changes must
     * be ensured that they use !important as well
     **/
    var setStyleImportant;
    if ((!isIE) && !!document['documentElement']['style']['setProperty']) {
        // W3C says use setProperty, with the "important" 3rd param
        setStyleImportant = function(element, prop, value) {
            element['style']['setProperty'](prop, value, "important");
        }                    
    } else {
        // IE <= 8 doesn't support setProperty, so we must manually set
        // the cssText, including the !important statement
        setStyleImportant = function(element, prop, value) {
            element['style']['cssText'] += ";"+prop+":"+value+" !important;";
        }
    }







    var setRotation;
    if(window['CSSMatrix']) setRotation = function(element, rotation){
        element.style['transform'] = 'rotate('+(rotation||0)+'rad)';
        return element;
    };
    else if(window['WebKitCSSMatrix']) setRotation = function(element, rotation){
        element.style['webkitTransform'] = 'rotate('+(rotation||0)+'rad)';
        return element;
    };
    else if(isGecko) setRotation = function(element, rotation){
        element.style['MozTransform'] = 'rotate('+(rotation||0)+'rad)';
        return element;
    };
    else if(isIE) setRotation = function(element, rotation){
        if(!element._oDims)
            element._oDims = [element.offsetWidth, element.offsetHeight];
        var c = Math.cos(rotation||0) * 1, s = Math.sin(rotation||0) * 1;
        
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
    else setRotation = function(element){ return element; }



    //{components.js}
    //{core.js}
    //{resources.js}
    //{networking.js}
    
    
    
    
    
    // The main SGF namespace.
    var SGF = new EventEmitter();
    SGF['toString'] = functionReturnString("[object SGF]");
    window['SGF'] = SGF;
    
    //////////////////////////////////////////////////////////////////////
    //////////////////// "SGF" PUBLIC FUNCTIONS //////////////////////////
    //////////////////////////////////////////////////////////////////////
    function log() {
        var args = arguments;
        if (window['console'] && console['log']) {
            // Function.prototype.apply.call is necessary for IE, which
            // doesn't support console.log.apply. 
            Function.prototype.apply.call(console['log'], console, args);
        }
        // Optionally listen for 'log' events from the SGF object, which you
        // could then write to a <textarea> or something for a custom debug
        // panel.
        SGF['emit']("log", args);
    }
    SGF['log'] = log;
    
    function inherits(ctor, superCtor) {
        var klass = function() {};
        klass.prototype = superCtor.prototype;
        ctor.prototype = new klass;
        ctor.prototype['constructor'] = ctor;
    }
    SGF['inherits'] = inherits;
    
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



    

    // Attempts to retrieve the absolute path of the executing script.
    // Pass a function as 'callback' which will be executed once the
    // URL is known, with the first argument being the string URL.
    function getScriptName(callback) {
        try {
            (0)();
        } catch (ex) {
            // Getting the URL of the exception is non-standard, and
            // different in EVERY browser unfortunately.
            if (ex['fileName']) { // Firefox
                callback(ex['fileName']);
            } else if (ex['sourceURL']) { // Safari
                callback(ex['sourceURL']);
            } else if (ex['arguments']) { // V8 (Chrome)
                var originalPrepareStackTrace = Error['prepareStackTrace'];
                Error['prepareStackTrace'] = function(error, structuredStackTrace) {
                    return structuredStackTrace[1]['getFileName']();
                }
                var stack = ex['stack'];
                Error['prepareStackTrace'] = originalPrepareStackTrace;
                callback(stack);

            } else if (ex['stack']) { // Opera 10
                var s = ex['stack'];
                s = s.split("\n")[0];
                s = s.substring(s.indexOf("@")+1);
                callback(s.substring(0, s.lastIndexOf(":")));

            } else { // Internet Explorer 8+
                var origOnError = window['onerror'];
                window['onerror'] = function(msg, url){
                    window['onerror'] = origOnError;
                    callback(url);
                    return true;
                }
                throw ex;
            }
        }
    }
    
    // Attempts to retrieve a reference to the currently executing
    // DOM node. The node can then be inspected for any user-given
    // runtime arguments (data-* attributes) on the <script>.
    function getScript(scriptName) {
        var scripts = document.getElementsByTagName("script"),
            length = scripts.length,
            script = document.getElementById("SGF-script");
        
        if (script) return script;
        
        while (length--) {
            script = scripts[length];
            if (script['src'] === scriptName) {
                return script;
            }
        }
        
        throw new Error('FATAL: Could not find <script> node with "src" === "'+scriptName+'"\n'
            + 'Please report this to the SGF issue tracker. You can work around this error by '
            + 'explicitly setting the "id" of the <script> node to "SGF-script".');
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
                &&  isSoundJsLoaded()
                &&  hasWebSocket();
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
        libraryLoaded();
    }
    
    // Returns true if Sound.js is loaded, false otherwise.
    function isSoundJsLoaded() {
        return "Sound" in window && "SoundChannel" in window;
    }
    
    function soundJsLoaded() {
        window['Sound']['swfPath'] = makeFullyQualified(params['soundjs-swf']);
        //log("SoundJS SWF Path: " + window['Sound']['swfPath']);
        libraryLoaded();
    }
    
    // Returns true if SWFObject, at least version 2.2, is loaded, false otherwise.
    function isSwfObjectLoaded() {
        var swfobject = 'swfobject', embedSWF = 'embedSWF';
        return swfobject in window && embedSWF in window[swfobject];
    }
    
    // Called once SWFObject (v2.2 or better) is assured loaded
    function swfObjectLoaded() {
        // Load Sound.js
        if (isSoundJsLoaded()) {
            soundJsLoaded();
        } else {
            new Script(makeFullyQualified(params['soundjs']), soundJsLoaded);
        }
        
        // Load gimite's Flash WebSocket implementation (only if required)
        if (!hasWebSocket()) {
            new Script(makeFullyQualified(params['fabridge']), function() {
                new Script(makeFullyQualified(params['websocket']), flashWebSocketLoaded);
            });
        }
    }
    
    function hasWebSocket() {
        return 'WebSocket' in window;
    }
    
    function flashWebSocketLoaded() {
        window['WebSocket']['__swfLocation'] = makeFullyQualified(params['websocket-swf']);
        window['WebSocket']['__initialize']();
        libraryLoaded();
    }


    //////////////////////////////////////////////////////////////////////
    ///////////////////// "UTILITY" FUNCTIONS ////////////////////////////
    //////////////////////////////////////////////////////////////////////

    // Borrowed respectfully from Prototype
    // TODO: Make public? "SGF.extend"?
    function extend(destination, source) {
      for (var property in source)
        destination[property] = source[property];
      return destination;
    }
    
    // Array Remove - By John Resig (MIT Licensed)
    function arrayRemove(array, from, to) {
      var rest = array.slice((to || from) + 1 || array.length);
      array.length = from < 0 ? array.length + from : from;
      return array.push.apply(array, rest);
    }

    // Tests if the given path is fully qualified or relative.
    //    TODO: Replace this with a nice regexp.
    function isFullyQualified(path) {
        return path.substring(0,7) == "http://"
            || path.substring(0,8) == "https://"
            || path.substring(0,7) == "file://";
    }
    
    function makeFullyQualified(path) {
        return isFullyQualified(path) ? path : engineRoot + path;
    }
    
    // Performs the necessary operations to make a regular JavaScript
    // constructor Function compatible with Prototype's Class implementation.
    function makePrototypeClassCompatible(classRef) {
        classRef.prototype['initialize'] = classRef;
        classRef['subclasses'] = [];
    }
    
    
    function functionBind(funcRef, context) {
        return function() {
            return funcRef.apply(context, arguments);
        }
    }

    // Returns a new Function that returns the value passed into the function
    // Used for the 'toString' implementations.
    function functionReturnString(string) {
        return function() {
            return string;
        }
    }
    
    // Returns a function that returns the name of the property specified on 'this'
    function returnThisProp(prop) {
        return function() {
            return this[prop];
        }
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
            new Script(makeFullyQualified(params['prototype']), prototypeLoaded);
        }
        if (isSwfObjectLoaded()) {
            swfObjectLoaded();
        } else {
            new Script(makeFullyQualified(params['swfobject']), swfObjectLoaded);
        }
        
    }

    // Called as an 'event' (asynchronously) once all the required library
    // files have finished their loading process. Once this happens, we can
    // define all the SGF classes, and afterwards invoke the 'load' listeners.
    function allLibrariesLoaded() {
        //log("all libs loaded!");
                
        Input['grab']();
        
        sgfLoaded();
    }
    
    // Called as an 'event' when the SGF engine has finished initializing.
    // At this point, export stuff from the closure to the global scope,
    // then check for the existence of a 'game' or 'game'&'screen' param
    // on the <script> node to begin autoplaying.
    function sgfLoaded() {

        var loadEndTime = new Date();
        //log("Load Time: "+(loadEndTime.getTime() - loadStartTime.getTime())+" ms");

        if (params['game']) {
            if (params['screen']) {
                startWithDiv(params['game'], params['screen']);
            } else {
                startFullScreen(params['game']);
            }
        }
        
    }

    


    //// Start things off... /////////////////////////////////////////////
    getScriptName(scriptNameKnown);

})(this, document);
