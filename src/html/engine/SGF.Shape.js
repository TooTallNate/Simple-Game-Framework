/** section: Components API
 * class SGF.Shape < SGF.Component
 *
 * Another abstract class, not meant to be instantiated directly. All "shape"
 * type [[SGF.Component]] classes use this class as a base class. The only
 * functionality that this class itself adds to a regular [[SGF.Component]] is
 * [[SGF.Shape#color]], since all shapes can have a color set for them.
 **/
SGF.Shape = Class.create(SGF.Component, {
    /**
     * new SGF.Shape([options])
     * - options (Object): The optional 'options' object's properties are copied
     *                     this [[SGF.Shape]] in the constructor. It allows all
     *                     the same default properties as [[SGF.Component]], but
     *                     also adds [[SGF.Shape#color]].
     *
     * This will never be called directly in your code, use one of the subclasses
     * to instantiate [[SGF.Shape]]s.
     **/
    initialize: function($super, options) {
        $super(Object.extend(Object.clone(SGF.Shape.DEFAULTS), options || {}));
    },
    render: function($super, interpolation) {
        if (this.__color != this.color) {
            this.element.style.backgroundColor = "#" + this.color;
            this.__color = this.color;
        }
        $super(interpolation);
    }
});

/**
 * SGF.Shape.DEFAULTS -> Object
 *
 * The default values used when creating [[SGF.Shapes]]s. These values, as well
 * as the values from [[SGF.Component.DEFAULTS]] are copied onto the [[SGF.Shape]],
 * if they are not found in the `options` argument.
 *
 * The [[SGF.Shape.DEFAULTS]] object contains the default values:
 *
 *     - color: "000000"
 **/
SGF.Shape.DEFAULTS = {
    /**
     * SGF.Shape#color -> String
     *
     * The color of the [[SGF.Shape]]. The String value is expected to be like
     * a CSS color string. So it should be a **six** (not three) character
     * String formatted in `RRGGBB` form. Each color is a 2-digit hex number
     * between 0 and 255.
     **/
    color: "000000"
};
