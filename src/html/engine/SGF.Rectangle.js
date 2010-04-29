// requires Shape

/** section: Components API
 * class SGF.Rectangle < SGF.Shape
 *
 * A [[SGF.Component]] that renders a single rectangle onto the screen.
 **/
SGF.Rectangle = Class.create(SGF.Shape, {
    initialize: function($super, options) {
        $super(Object.extend(Object.clone(SGF.Rectangle.DEFAULTS), options || {}));
    },
    getElement: function() {
        this.__color = this.color;
        return new Element("div").setStyle({
            position: "absolute",
            backgroundColor: "#" + this.color
        });
    }
});

SGF.Rectangle.DEFAULTS = {
};
