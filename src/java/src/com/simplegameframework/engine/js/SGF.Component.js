SGF.Component = Class.create({
    initialize: function(options) {
        Object.extend(this, Object.extend(Object.clone(SGF.Component.DEFAULTS), options || {}));
        this.__component = this.getJavaComponent();
        this.__component.setJsObj(this);
    },
    getJavaComponent: function() {
        return new Packages.com.simplegameframework.engine.Component(this);
    },
    update: function() {
        if (this.dx !== 0) {
            this.x = this.x + this.dx;
        }
        if (this.dy !== 0) {
            this.y = this.y + this.dy;
        }
    },
    render: Prototype.emptyFunction
});

SGF.Component.DEFAULTS = {
    width:    10,
    height:   10,
    x:        0,
    y:        0,
    dx:       0,
    dy:       0,
    opacity:  1.0,
    rotation: 0,
    zIndex:   0
};
