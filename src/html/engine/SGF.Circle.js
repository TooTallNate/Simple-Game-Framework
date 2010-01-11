SGF.Circle = Class.create(SGF.Shape, {
    initialize: function($super, options) {
        $super(Object.extend(Object.clone(SGF.Circle.DEFAULTS), options || {}));
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

    render: function($super, interpolation) {
        $super(interpolation);
        if (this.radius != this.__radius) {
            if (Prototype.Browser.WebKit) {
                this.element.style.webkitBorderRadius = (this.radius * SGF.Screen.getScale()) + "px";
            } else if (Prototype.Browser.Gecko) {
                this.element.style.MozBorderRadius = (this.radius * SGF.Screen.getScale()) + "px";
            }
            this.__radius = this.radius;
        }
    },

    radiusChanged: function() {
        this.width = this.height = this.radius*2;
    }
});


SGF.Circle.DEFAULTS = {
    radius: 10
};
