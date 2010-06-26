var Sound = function(path) {
    var self = this;

    EventEmitter.call(self);
}
Sound['subclasses'] = [];
// so that (soundInstance instanceof EventEmitter) === true
Sound.prototype = new EventEmitter(true);

Sound.prototype['toString'] = functionReturnString("[object Sound]");

modules['sound'] = Sound;
