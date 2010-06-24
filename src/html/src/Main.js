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
        'fabridge':     'lib/fabridge.js',
        'soundjs':      'lib/sound.min.js',
        'soundjs-swf':  'lib/sound.swf',
        'websocket':    'lib/web_socket.js',
        'websocket-swf':'lib/WebSocketMain.swf'
    },
    loadStartTime = new Date(),
    // "Modules" are the classes retrieved from calling SGF.require().
    modules = {};

    //{core.js}
    //{resources.js}
    
    // The main SGF namespace.
    var SGF = new EventEmitter();
    SGF['toString'] = function() {
        return "[object SGF]";
    }

    // Attempts to retrieve the absolute path of the executing script.
    // Use this in conjunction with 'getScript' to get a reference to
    // the currently executing script DOM node.
    function getScriptName(callback) {
        try {
            // Intentionally invoke an exception
            (0)();
        } catch(e) {
            // Getting the URL of the exception is non-standard, and
            // different in EVERY browser unfortunately.
            var s = e['stack'];
            if (e['sourceURL']) { // Safari
                //console.log("safari");
                callback(e['sourceURL']);
            } else if (e['arguments']) { // Chrome
                //console.log("chrome");
                s = s.split("\n")[2];
                s = s.substring(s.indexOf("(")+1);
                s = s.substring(0, s.lastIndexOf(":"));
                callback(s.substring(0, s.lastIndexOf(":")));
            } else if (s) { // Firefox & Opera 10+
                //console.log("firefox");
                s = s.split("\n")[0];
                s = s.substring(s.indexOf("@")+1);
                callback(s.substring(0, s.lastIndexOf(":")));
            } else { // Internet Explorer
                //console.log("internet explorer");
                var origOnError = window['onerror'];
                window['onerror'] = function(msg, url){
                    window['onerror'] = origOnError;
                    callback(url);
                    return true;
                }
                throw e;
            }
        }
    }
    
    // Attempts to retrieve a reference to the currently executing
    // DOM node. The node can then be inspected for any user-given
    // runtime arguments (data-* attributes) on the <script>.
    function getScript(scriptName) {
        var scripts = document.getElementsByTagName("script"),
            length = scripts.length;
        while (length--) {
            if (scripts[length]['src'] === scriptName)
                return scripts[length];
        }
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
                &&  isSoundJsLoaded();
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
        loadElementSetStyleImportant();
        loadElementSetRotation();
        libraryLoaded();
    }
    
    // Returns true if Sound.js is loaded, false otherwise.
    function isSoundJsLoaded() {
        return 'Sound' in window;
    }

    // Returns true if SWFObject, at least version 2.2, is loaded, false otherwise.
    function isSwfObjectLoaded() {
        var swfobject = 'swfobject', embedSWF = 'embedSWF';
        return swfobject in window && embedSWF in window[swfobject];
    }
    
    // Called once SWFObject (v2.2 or better) is assured loaded
    function swfObjectLoaded() {
        // Load Sound.js
        if (!isSoundJsLoaded()) {
            new Script(engineRoot + params['soundjs'], function() {
                window['Sound']['swfPath'] = engineRoot + "lib/Sound.swf";
                libraryLoaded();
            });
        }
        
        // Load gimite's Flash WebSocket implementation (only if required)
        //if (!'WebSocket' in window) {
            // TODO: Add Flash WebSocket fallback
        //}
    }

    
    /* The DOM nodes that SGF manipulates are always modified through
     * JavaScript, but just setting style.blah won't overwrite !important
     * in CSS style sheets. In order to compensate, all style changes must
     * be ensured that they use !important as well
     **/
    function loadElementSetStyleImportant() {
        Element['addMethods']({
            'setStyleI': (function(){ 
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

        if(window['CSSMatrix']) transform = function(element, transform){
            element.style['transform'] = 'rotate('+(transform||0)+'rad)';
            return element;
        };
        else if(window['WebKitCSSMatrix']) transform = function(element, transform){
            element.style['webkitTransform'] = 'rotate('+(transform||0)+'rad)';
            return element;
        };
        else if(Prototype['Browser']['Gecko']) transform = function(element, transform){
            element.style['MozTransform'] = 'rotate('+(transform||0)+'rad)';
            return element;
        };
        else if(Prototype['Browser']['IE']) transform = function(element, transform){
            if(!element._oDims)
                element._oDims = [element.offsetWidth, element.offsetHeight];
            var c = Math.cos(transform||0) * 1, s = Math.sin(transform||0) * 1;
            
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
        else transform = function(element){ return element; }

        Element['addMethods']({ 'setRotation': transform });
    }


    //////////////////////////////////////////////////////////////////////
    ///////////////////// "UTILITY" FUNCTIONS ////////////////////////////
    //////////////////////////////////////////////////////////////////////
    
    // An empty function.
    function emptyFunction() {}
        
    // Array Remove - By John Resig (MIT Licensed)
    function arrayRemove(array, from, to) {
      var rest = array.slice((to || from) + 1 || array.length);
      array.length = from < 0 ? array.length + from : from;
      return array.push.apply(array, rest);
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
            new Script((params['prototype'].indexOf("lib") === 0 ? engineRoot : "") + params['prototype'], prototypeLoaded);
        }
        if (isSwfObjectLoaded()) {
            swfObjectLoaded();
        } else {
            new Script((params['swfobject'].indexOf("lib") === 0 ? engineRoot : "") + params['swfobject'], swfObjectLoaded);
        }
        
    }

    // Called as an 'event' (asynchronously) once all the required library
    // files have finished their loading process. Once this happens, we can
    // define all the SGF classes, and afterwards invoke the 'load' listeners.
    function allLibrariesLoaded() {
        log("all libs loaded!");
        
        // These comments below are directives for the 'compile' script.
        // The comments themselves will be replaced by the contents of the
        // script file from the name in the comment.
        
        //{networking.js}
        //{components.js}

        window['SGF'] = SGF;
        
        Input['grab']();
        
        sgfLoaded();
    }
    
    // Called as an 'event' when the SGF engine has finished initializing.
    // At this point, export stuff from the closure to the global scope,
    // then check for the existence of a 'game' or 'game'&'screen' param
    // on the <script> node to begin autoplaying.
    function sgfLoaded() {

        var loadEndTime = new Date();
        log("Load Time: "+(loadEndTime.getTime() - loadStartTime.getTime())+" ms");

        if (params['game']) {
            if (params['screen']) {
                startWithDiv(params['game'], params['screen']);
            } else {
                startFullScreen(params['game']);
            }
        }
        
    }

    


    //////////////////////////////////////////////////////////////////////
    //////////////////// "SGF" PUBLIC FUNCTIONS //////////////////////////
    //////////////////////////////////////////////////////////////////////
    function log() {
        var args = arguments;
        if (window['console'] && console['log']) {
            console['log'].apply(console, args);
        }
        SGF['fireEvent']("log", args);
    }
    SGF['log'] = log;
    
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


    //// Start things off... /////////////////////////////////////////////
    getScriptName(scriptNameKnown);

})(this, document);
