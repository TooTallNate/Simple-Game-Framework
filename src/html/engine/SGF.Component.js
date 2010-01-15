/**
 * == Components API ==
 * "Components" are the Object Oriented classes that are created by your game code,
 * added to your game loop and rendered on the screen.
 **/

/** section: Components API
 * class SGF.Component
 *
 * An abstract base class for game components. It cannot be instantiated directly,
 * but its subclasses are the building blocks for SGF games.
 **/
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
    getElement: function() { throw "SGF.Component can't be instatiated directly, please use a subclass."; },
    toElement: function() {
        return this.element;
    },
    /**
     * SGF.Component#left() -> Number
     * 
     * Returns the number of pixels from left side of the screen to the left
     * side of the [[SGF.Component]].
     **/
    left: function() {
        return this.x;
    },
    /**
     * SGF.Component#top() -> Number
     *
     * Returns the number of pixels from the top of the screen to the top
     * of the [[SGF.Component]].
     **/
    top: function() {
        return this.y;
    },
    /**
     * SGF.Component#right() -> Number
     *
     * Returns the number of pixels from left side of the screen to the right
     * side of the [[SGF.Component]].
     **/
    right: function() {
        return this.x + this.width - 1;
    },
    /**
     * SGF.Component#bottom() -> Number
     * 
     * Returns the number of pixels from the top side of the screen to the
     * bottom of the [[SGF.Component]].
     **/
    bottom: function() {
        return this.y + this.height - 1;
    },
    /**
     * SGF.Component#render(interpolation, renderCount) -> undefined
     * - interpolation (Number): The percentage (value between 0.0 and 1.0)
     *                           between the last call to update and the next
     *                           call to update this call to render is taking place.
     *                           This number is used to "predict" the location of
     *                           this [[SGF.Component]] if the FPS are higher than
     *                           UPS, and the [[SGF.Component#dx]]/[[SGF.Component#dy]]
     *                           values are being used.
     * - renderCount (Number): The total number of times that [[SGF.Game#render]]
     *                         has been called for this game. This value has nothing
     *                         to do with the number of times this [[SGF.Component]]
     *                         has been rendered.
     * 
     * Renders the individual [[SGF.Component]]. This is called automatically in
     * the game loop once this component has been added through [[SGF.Game#addComponent]].
     *
     * Subclasses of [[SGF.Component]] override this method, and render how it
     * should be rendered. This default implementation does nothing, since
     * a [[SGF.Component]] itself cannot be rendered/instantiated.
     **/
    render: function(interpolation) {
        var scale = SGF.Screen.getScale();

        if (this.__opacity != this.opacity) {
            this.element.setOpacity(this.opacity);
            this.__opacity = this.opacity;
        }

        if (this.__rotation != this.rotation) {
            this.element.setRotation(this.rotation * (Math.PI/180)); // Convert from Deg to Rad
            this.__rotation = this.rotation;
        }

        if (this.__zIndex != this.zIndex) {
            this.__fixZIndex();
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
    /**
     * SGF.Component#update(updateCount) -> undefined
     * - updateCount (Number): The total number of times that [[SGF.Game#update]]
     *                         has been called for this game. This value has nothing
     *                         to do with the number of times this [[SGF.Component]]
     *                         has been updated.
     *
     * Updates the state of the individual [[SGF.Component]]. This is called in
     * the game loop once this component has been added through [[SGF.Game#addComponent]].
     **/
    update: function() {
        if (this.dx !== 0) {
            this.x = this.x + this.dx;
        }
        if (this.dy !== 0) {
            this.y = this.y + this.dy;
        }
    },
    __fixZIndex: function() {
        this.element.style.zIndex =
            this.parent && this.parent.__computeChildZIndex ?
                this.parent.__computeChildZIndex(this.zIndex) :
                this.zIndex;
    }
});

/**
 * SGF.Component.DEFAULTS -> Object
 *
 * The default values used when creating [[SGF.Component]]s. These values are
 * copied onto the [[SGF.Component]], if they are not found in the **options** argument.
 *
 * The [[SGF.Component.DEFAULTS]] object contains the default values:
 *
 *     - width: 10
 *     - height: 10
 *     - x: 0
 *     - y: 0
 *     - dx: 0
 *     - dy: 0
 *     - opactity: 1.0
 *     - rotation: 0
 *     - zIndex: 0
 **/
SGF.Component.DEFAULTS = {
    /**
     * SGF.Component#width -> Number
     *
     * The width of the [[SGF.Component]]. This is a readable and writable
     * property. That is, if you would like to reize the [[SGF.Component]],
     * you could try something like:
     *
     *     this.width = this.width * 2;
     *
     * To double the current width of the [[SGF.Component]].
     **/
    width: 10,
    /**
     * SGF.Component#height -> Number
     *
     * The height of the [[SGF.Component]]. This is a readable and writable
     * property. That is, if you would like to reize the [[SGF.Component]],
     * you could try something like:
     *
     *     this.height = SGF.Screen.height;
     *
     * To set the height of this [[SGF.Component]] to the current height of the
     * game screen.
     **/
    height: 10,
    /**
     * SGF.Component#x -> Number
     *
     * The X coordinate of the top-left point of the [[SGF.Component]] from the
     * top-left of the game screen.
     *
     *     update: function($super) {
     *         this.x++;
     *         $super();
     *     }
     *
     * This is an example of overwritting the [[SGF.Component#update]] method,
     * and incrementing the X coordinate every step through the game loop.
     * This will smoothly pan the [[SGF.Component]] across the game screen at
     * the [[SGF.Game]]'s set game speed.
     **/
    x: 0,
    /**
     * SGF.Component#y -> Number
     *
     * The Y coordinate of the top-left point of the [[SGF.Component]] from the
     * top-left of the game screen.
     **/
    y: 0,
    /**
     * SGF.Component#dx -> Number
     *
     * The &#916; (delta, or "change in") X each time around the game loop. Basically,
     * this value is the X-speed of the the [[SGF.Component]]. Setting it to
     * 1 will increment the [[SGF.Component#x]] value by 1 each call to
     * [[SGF.Component#update]]. It's important to note that you could have
     * accieved this effect the same way by manually incrementing the [[SGF.Component#x]]
     * value in your [[SGF.Component#update]] subclass, however this value is
     * used at a deeper level. In the case where the game's rendering speed is
     * greater than it's update speed, this value can be used to "predict" how
     * to render frames in between [[SGF.Game#update]]s.
     *
     * In short, using this value to control constant speed can give smoother
     * game experience on faster hardware.
     **/
    dx: 0,
    /**
     * SGF.Component#dy -> Number
     *
     * Same as [[SGF.Component#dx]], but for the Y coordinate.
     **/
    dy: 0,
    /**
     * SGF.Component#opacity -> Number
     *
     * A percentage value (between 0.0 and 1.0, inclusive) that describes the
     * [[SGF.Component]]'s opacity. Setting this value to 1.0 (default) will
     * make the [[SGF.Component]] fully opaque. Setting to 0.0 will make it
     * fully transparent, or invisible. Setting to 0.5 will make it 50% transparent.
     * You get the idea...
     **/
    opacity: 1.0,
    /**
     * SGF.Component#rotation -> Number
     *
     * The rotation value of the [[SGF.Component]] in degrees. Note that the
     * [[SGF.Component#x]], [[SGF.Component#y]] properties, and values returned
     * from [[SGF.Component#left]], [[SGF.Component#right]], [[SGF.Component#top]],
     * and [[SGF.Component#bottom]] are not affected by this value. Therefore,
     * any calculations that require the rotation to be a factor, your game code
     * must calculate itself.
     **/
    rotation: 0,
    /**
     * SGF.Component#zIndex -> Number
     *
     * The Z index of this [[SGF.Component]]. Setting this value higher than
     * other [[SGF.Component]]s will render this [[SGF.Component]] above ones
     * with a lower **zIndex**.
     **/
    zIndex: 0
};
