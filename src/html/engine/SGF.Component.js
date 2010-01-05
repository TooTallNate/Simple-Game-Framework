SGF.Component = Class.create({
    initialize: function(options) {
        Object.extend(this, Object.extend(Object.clone(SGF.Component.DEFAULTS), options || {}));
        this.element = this.getElement();
        this.scale(SGF.Screen.getScale());
    },
    /*
     * SGF.Component#getElement() -> Element
     * Internal method. Game developers need not be aware.
     **/
    getElement: Function.ABSTRACT,
    toElement: function() {
        return this.element;
    },
    /**
     * SGF.Component#left() -> Number
     * Returns the number of pixels from left side of the screen to the left
     * side of the Component.
     */
    left: function() {
        return this.x;
    },
    /**
     * SGF.Component#top() -> Number
     * Returns the number of pixels from the top of the screen to the top
     * of the Component.
     **/
    top: function() {
        return this.y;
    },
    /**
     * SGF.Component#left() -> Number
     * Returns the number of pixels from left side of the screen to the right
     * side of the Component.
     */
    right: function() {
        return this.x + this.width;
    },
    /**
     * SGF.Component#bottom() -> Number
     * Returns the number of pixels from the top side of the screen to the
     * bottom of the Component.
     **/
    bottom: function() {
        return this.y + this.height;
    },
    /**
     * SGF.Component#render() -> undefined
     * Renders the individual Component.
     */
    render: function(interpolation) {
        var scale = SGF.Screen.getScale();

        if (this.__opacity != this.opacity) {
            this.element.setOpacity(this.opacity);
            this.__opacity = this.opacity;
        }

        if (this.__rotation != this.rotation) {
            this.element.transform({
                rotation: this.rotation * (Math.PI/180) // Convert from Deg to Rad
            });
            this.__rotation = this.rotation;
        }

        if (this.__zIndex != this.zIndex) {
            this.element.style.zIndex = this.zIndex;
            this.__zIndex = this.zIndex;
        }

        if (this.__width != this.width) {
            this.element.style.width = (this.width * scale) + "px";
            this.__width = this.width;
        }
        if (this.__height != this.height) {
            this.element.style.height = (this.height * scale) + "px";
            this.__height = this.height;
        }

        if (this.dx !== 0) {
            this.element.style.left = ((this.x + (this.dx * interpolation)) * scale) + "px";
            this.__x = this.x;
        } else if (this.__x != this.x) {
            this.__x = this.x;
            this.element.style.left = (this.x * scale) + "px";
        }

        if (this.dy !== 0) {
            this.element.style.top = ((this.y + (this.dy * interpolation)) * scale) + "px";
            this.__y = this.y;
        } else if (this.__y != this.y) {
            this.__y = this.y;
            this.element.style.top = (this.y * scale) + "px";
        }
    },
    scale: function(currentScale) {
        this.element.setStyle({
            width: (this.width * currentScale) + "px",
            height: (this.height * currentScale) + "px",
            top: (this.y * currentScale) + "px",
            left: (this.x * currentScale) + "px"
        });
        this.__width = this.width;
        this.__height = this.height;
        this.__x = this.x;
        this.__y = this.y;
    },
    update: function() {
        if (this.dx !== 0) {
            this.x = this.x + this.dx;
        }
        if (this.dy !== 0) {
            this.y = this.y + this.dy;
        }
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
