/** section: Components API
 * class SGF.Rectangle < SGF.Shape
 *
 * A [[SGF.Component]] that renders a single rectangle onto the screen.
 **/
var Rectangle = Class.create(Shape, {
    initialize: function($super, options) {
        $super(Object.extend(Object.clone(Rectangle.DEFAULTS), options || {}));
    },
    getElement: function() {
        this.__color = this.color;
        return new Element("div").setStyle({
            position: "absolute",
            backgroundColor: "#" + this.color
        });
    }
});

Rectangle.DEFAULTS = {
};

modules['rectangle'] = Rectangle;
