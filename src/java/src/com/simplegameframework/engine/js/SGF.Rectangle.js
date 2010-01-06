SGF.Rectangle = Class.create(SGF.Component, {
    initialize: function($super, options) {
        $super(Object.extend(Object.clone(SGF.Rectangle.DEFAULTS), options || {}));
    },
    getJavaComponent: function() {
        return new Packages.com.simplegameframework.engine.Rectangle(this);
    }
});

SGF.Rectangle.DEFAULTS = {
    color: "000000"
};