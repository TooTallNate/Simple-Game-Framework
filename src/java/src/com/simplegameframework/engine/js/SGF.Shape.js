SGF.Shape = Class.create(SGF.Component, {
    initialize: function($super, options) {
        $super(Object.extend(Object.clone(SGF.Shape.DEFAULTS), options || {}));
    },
    getJavaComponent: function() {
        return new Packages.com.simplegameframework.engine.Shape(this);
    },
    __getColor: function() {
        return this.color;
    },
    __getFill: function() {
        return this.fill;
    }
});

SGF.Shape.DEFAULTS = {
    color: "000000",
    fill: true
};