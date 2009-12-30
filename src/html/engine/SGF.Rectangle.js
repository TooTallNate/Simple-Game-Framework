SGF.Rectangle = Class.create({
    initialize: function(options) {
        Object.extend(this, Object.extend(Object.clone(this.constructor.DEFAULT_OPTIONS), options || {}));
        var scale = SGF.Screen.getScale();
        this.element = new Element("div").setStyle({
            position: "absolute",
            width: (this.width * scale) + "px",
            height: (this.height * scale) + "px",
            backgroundColor: this.color
        });
        this.__width = this.width;
        this.__height = this.height;
        this.__x = this.x;
        this.__y = this.y;
        SGF.Screen.element.insert(this.element);
    },
    update: function() {
        if (this.dx !== 0) {
            this.x = this.x + this.dx;
        }
        if (this.dy !== 0) {
            this.y = this.y + this.dy;
        }
    },
    render: function(interpolation) {
        var scale = SGF.Screen.getScale();

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
    }
});

Object.extend(SGF.Rectangle, {
    DEFAULT_OPTIONS: {
        color: "#000000",
        width: 10,
        height: 10,
        x: 0,
        y: 0,
        dx: 0,
        dy: 0
    }
});