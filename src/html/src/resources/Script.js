/** section: Resources API
 * class Script
 *
 * The `Script` class is responsible for loading additional JavaScript source
 * files into your SGF game's JavaScript environment.
 **/
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
    
    if (onLoad) {
        self['addListener']("load", onLoad);
    }
    
    script['type'] = "text/javascript";
    script['setAttribute']("async", "true");

    script['onload'] = script['onreadystatechange'] = function() {
        if ((!script['readyState'] || script['readyState'] == "loaded" || script['readyState'] == "complete")) {

            // Remove script from the document.
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
            // Now remove all properties on the object
            for (var prop in script) {
                delete script[prop];
            }
            script = null;

            //log("readyState: " + script['readyState']);
            self['loaded'] = true;
        	self['emit']("load");
        }
    }

    script['src'] = scriptUrl;

    // Add the script element to the document head
    document.getElementsByTagName("head")[0].appendChild(script);

    // Set our 'src' after appending to "head" so that the URL is absolute.
    self['src'] = script['src'];
}

inherits(Script, EventEmitter);
makePrototypeClassCompatible(Script);

Script.prototype['loaded'] = false;
Script.prototype['toString'] = functionReturnString("[object Script]");

modules['script'] = Script;
