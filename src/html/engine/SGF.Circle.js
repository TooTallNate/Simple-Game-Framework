SGF.Circle = Class.create(SGF.Rectangle, {
    initialize: function($super, options) {
        $super(Object.extend(Object.clone(SGF.Circle.DEFAULTS), options || {}));
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
    radius: 5
};
