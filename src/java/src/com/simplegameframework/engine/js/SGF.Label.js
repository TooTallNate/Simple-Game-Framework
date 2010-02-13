SGF.Label = Class.create(SGF.Component, {
    initialize: function($super, options) {
        this.__getText = this.getText;
        $super(Object.extend(Object.clone(SGF.Label.DEFAULTS), options || {}));
    },
    getJavaComponent: function() {
        return new Packages.com.simplegameframework.engine.Label(this);
    },

    __getAlign: function() {
        return this.align;
    },
    __getFont: function() {
        return this.font;
    },
    __getColor: function() {
        return this.color;
    },
    __getSize: function() {
        return this.size;
    },
    setText: function(text) {
        this.__text = text;
    },
    getText: function() {
        return this.__text;
    }
});

Object.extend(SGF.Label, {
    DEFAULTS: {
        align: 0,
        color: "FFFFFF",
        font: new SGF.Font("monospace"),
        size: 12
    },
    LEFT: 0,
    CENTER: 1,
    RIGHT: 2,
    TAB_WIDTH: 4
});
