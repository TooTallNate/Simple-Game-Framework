SGF.Component = Class.create({
    initialize: function(options) {
        Object.extend(this, Object.extend(Object.clone(SGF.Component.DEFAULTS), options || {}));
        this.__component = this.getJavaComponent();
        this.__this = this;
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
    render: Prototype.emptyFunction,
    left: function() {
        return this.x;
    },
    top: function() {
        return this.y;
    },
    right: function() {
        return this.x + this.width - 1;
    },
    bottom: function() {
        return this.y + this.height - 1;
    },


    __render: function(interpolation, renderCount) {
        this.__this.render(interpolation, renderCount);
    },
    __update: function(updateCount) {
        this.__this.update(updateCount);
    },
    __getWidth: function() {
        return this.width;
    },
    __getHeight: function() {
        return this.height;
    },
    __getX: function() {
        return this.x;
    },
    __getY: function() {
        return this.y;
    },
    __getDx: function() {
        return this.dx;
    },
    __getDy: function() {
        return this.dy;
    },
    __getOpacity: function() {
        return this.opacity;
    },
    __getRotation: function() {
        return this.rotation;
    },
    __getZIndex: function() {
        return this.zIndex;
    }
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
