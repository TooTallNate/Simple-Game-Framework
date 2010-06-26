var Circle = Class.create(Shape, {
    'initialize': function($super, options) {
        $super(options || {});
        this.radiusChanged();
    },
    
    'getElement': function() {
        this.__color = this.color;
        return new Element("div").setStyle({
            position: "absolute",
            backgroundColor: "#" + this.color
        });
    },
    
    'update': function($super) {
        if (this.width != this.height || (this.radius*2) != this.width) {
            this.radiusChanged();
        }
        $super();
    },

    'render': (function() {
        if (Prototype['Browser']['WebKit']) {
            return function($super, interpolation) {
                $super(interpolation);
                if (this.radius != this.__radius) {
                    this.element['style']['webkitBorderRadius'] = (this.radius * SGF.Screen.getScale()) + "px";
                    this.__radius = this.radius;
                }
            };
        } else if (Prototype['Browser']['Gecko']) {
            return function($super, interpolation) {
                $super(interpolation);
                if (this.radius != this.__radius) {
                    this.element.style.MozBorderRadius = (this.radius * SGF.Screen.getScale()) + "px";
                    this.__radius = this.radius;
                }
            };
        } else {
            log("A form of Border Radius is not supported by this browser.");
            return function($super, interpolation) {
                $super(interpolation);
            };
        }
    })(),

    'radiusChanged': function() {
        this['width'] = this['height'] = this['radius']*2;
    }
});

Circle.prototype['radius'] = 10;

Circle.prototype['toString'] = functionReturnString("[object Circle]");

modules['circle'] = Circle;
