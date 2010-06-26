// Dynamically load a script element, calling an optional callback
// function once the script has finished loading.
function Script(game, scriptUrl, onLoad) {
    if (game instanceof Game) {
        scriptUrl = game['root'] + scriptUrl;
    } else {
        // Absolute URL was given...
        onLoad = scriptUrl;
        scriptUrl = game;
    }

    // Create a new script element with the specified src
    var script = document.createElement("script")
    ,   self = this;
    
    EventEmitter.call(self);
    
    script['type'] = "text/javascript";
    script['setAttribute']("async", "true");

    script['onload'] = script['onreadystatechange'] = function() {
        if (!script['readyState'] || script['readyState'] == "loaded" || script['readyState'] == "complete") {
            if (typeof onLoad == "function") {
                onLoad.apply(self, arguments);
            }
        }
    }

    script['src'] = scriptUrl;

    // Add the script element to the document head
    document.getElementsByTagName("head")[0].appendChild(script);

}
Script['subclasses'] = [];
Script.prototype = new EventEmitter(true);
Script.prototype['loaded'] = false;
Script.prototype['toString'] = functionReturnString("[object Script]");


// Expects a <script> node reference, and removes it from the DOM, and
// destroys the object in a memory leak free manner.
function destroyScript(script) {
    // If it's somewhere in the DOM, remove it!
    if (script.parentNode)
        script.parentNode.removeChild(script);
    // Now remove all properties on the object
    for (var prop in script)
        delete script[prop];
    return script;
}
Script['destroyScript'] = destroyScript;

modules['script'] = Script;
