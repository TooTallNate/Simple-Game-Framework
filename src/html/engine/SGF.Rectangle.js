SGF.Rectangle = Class.create(SGF.Component, {
    initialize: function($super, options) {
        $super(Object.extend(Object.clone(SGF.Rectangle.DEFAULTS), options || {}));
    },
    getElement: function() {
        this.__color = this.color;
        return new Element("div").setStyle({
            position: "absolute",
            backgroundColor: this.color
        });
    },
    render: function($super, interpolation) {
        if (this.__color != this.color) {
            this.element.style.backgroundColor = this.color;
            this.__color = this.color;
        }
        $super(interpolation);
    }
});

SGF.Rectangle.DEFAULTS = {
    color: "#000000"
};