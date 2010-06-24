var Circle = Class.create(Shape, {
    initialize: function($super, options) {
        $super(Object.extend(Object.clone(SGF.Circle.DEFAULTS), options || {}));
        this.radiusChanged();
    },
    
    getElement: function() {
        this.__color = this.color;
        return new Element("div").setStyle({
            position: "absolute",
            backgroundColor: "#" + this.color
        });
    },
    
    update: function($super) {
        if (this.width != this.height || (this.radius*2) != this.width) {
            this.radiusChanged();
        }
        $super();
    },

    render: (function() {
        if (Prototype.Browser.WebKit) {
            return function($super, interpolation) {
                $super(interpolation);
                if (this.radius != this.__radius) {
                    this.element.style.webkitBorderRadius = (this.radius * SGF.Screen.getScale()) + "px";
                    this.__radius = this.radius;
                }
            };
        } else if (Prototype.Browser.Gecko) {
            return function($super, interpolation) {
                $super(interpolation);
                if (this.radius != this.__radius) {
                    this.element.style.MozBorderRadius = (this.radius * SGF.Screen.getScale()) + "px";
                    this.__radius = this.radius;
                }
            };
        } else {
            SGF.log("A form of Border Radius is not supported by this browser.");
            return function($super, interpolation) {
                $super(interpolation);
            };
        }
    })(),

    radiusChanged: function() {
        this.width = this.height = this.radius*2;
    }
});

Circle.DEFAULTS = {
    radius: 10
};

modules['circle'] = Circle;
