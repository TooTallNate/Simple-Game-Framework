/** section: Components API
 * class SGF.Component
 *
 * An abstract base class for game components. It cannot be instantiated
 * directly, but its subclasses are the building blocks for SGF games.
 **/
function Component(options) {
    // Passing 'true' to the constructor is for extending classes (Container)
    if (options !== true) {
        extend(this, options || {});
        this['element'] = this['getElement']();
    }
}

/*
 * SGF.Component#getElement() -> Element
 * Internal method. Game developers need not be aware.
 **/
Component.prototype['getElement'] = (function() {
    var e = document.createElement("div");
    setStyleImportant(e, "position", "absolute");
    setStyleImportant(e, "overflow", "hidden");
    return function() {
        return e.cloneNode(false);
    }
})();

Component.prototype['toElement'] = returnThisProp("element");

/**
 * SGF.Component#left() -> Number
 * 
 * Returns the number of pixels from left side of the screen to the left
 * side of the [[SGF.Component]].
 **/
Component.prototype['left'] = returnThisProp("x");

/**
 * SGF.Component#top() -> Number
 *
 * Returns the number of pixels from the top of the screen to the top
 * of the [[SGF.Component]].
 **/
Component.prototype['top'] = returnThisProp("y");

/**
 * SGF.Component#right() -> Number
 *
 * Returns the number of pixels from left side of the screen to the right
 * side of the [[SGF.Component]].
 **/
Component.prototype['right'] = function() {
    return this['x'] + this['width'] - 1;
}

/**
 * SGF.Component#bottom() -> Number
 * 
 * Returns the number of pixels from the top side of the screen to the
 * bottom of the [[SGF.Component]].
 **/
Component.prototype['bottom'] = function() {
    return this['y'] + this['height'] - 1;
}

/**
 * Component#render(renderCount) -> undefined
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
Component.prototype['render'] = function(renderCount) {
    var self = this;
    
    if (self['__rotation'] != self['rotation']) {
        setRotation(self['element'], self['rotation']); // Radians
        self['__rotation'] = self['rotation'];
    }

    if (self['__opacity'] != self['opacity']) {
        Element['setOpacity'](self['element'], self['opacity']);
        self['__opacity'] = self['opacity'];
    }

    if (self['__zIndex'] != self['zIndex']) {
        self['__fixZIndex']();
        self['__zIndex'] = self['zIndex'];
    }

    if (self['__width'] != self['width']) {
        setStyleImportant(self['element'], "width", self['width'] + "px");
        self['__width'] = self['width'];
    }
    
    if (self['__height'] != self['height']) {
        setStyleImportant(self['element'], "height", self['height'] + "px");
        self['__height'] = self['height'];
    }

    if (self['__x'] != self['x']) {
        setStyleImportant(self['element'], "left", self['x'] + "px");
        self['__x'] = self['x'];
    }

    if (self['__y'] != self['y']) {
        self['__y'] = self['y'];
        setStyleImportant(self['element'], "top", self['y'] + "px");
    }
}

/**
 * SGF.Component#update(updateCount) -> undefined
 * - updateCount (Number): The total number of times that [[SGF.Game#update]]
 *                         has been called for this game. This value has nothing
 *                         to do with the number of times this [[SGF.Component]]
 *                         has been updated.
 *
 * Updates the state of the individual [[SGF.Component]]. This is called in
 * the game loop once this component has been added through
 * [[SGF.Game#addComponent]].
 *
 * This function should be thought of as the "logic" function for the [[SGF.Component]].
 **/
Component.prototype['update'] = function() {

}

Component.prototype['__fixZIndex'] = function() {
    var z = this.parent && this.parent.__computeChildZIndex ?
        this.parent.__computeChildZIndex(this.zIndex) :
        this.zIndex;
    setStyleImportant(this['element'], "z-index", z);
}

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
Component.prototype['width'] = 10;

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
Component.prototype['height'] = 10;

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
Component.prototype['x'] = 0;

/**
 * SGF.Component#y -> Number
 *
 * The Y coordinate of the top-left point of the [[SGF.Component]] from the
 * top-left of the game screen.
 **/
Component.prototype['y'] = 0;
/**
 * SGF.Component#opacity -> Number
 *
 * A percentage value (between 0.0 and 1.0, inclusive) that describes the
 * [[SGF.Component]]'s opacity. Setting this value to 1.0 (default) will
 * make the [[SGF.Component]] fully opaque. Setting to 0.0 will make it
 * fully transparent, or invisible. Setting to 0.5 will make it 50%
 * transparent. You get the idea...
 **/
Component.prototype['opacity'] = 1.0;
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
Component.prototype['rotation'] = 0;

/**
 * SGF.Component#zIndex -> Number
 *
 * The Z index of this [[SGF.Component]]. Setting this value higher than
 * other [[SGF.Component]]s will render this [[SGF.Component]] above ones
 * with a lower **zIndex**.
 **/
Component.prototype['zIndex'] = 0;

/**
 * Component#parent -> Container | null
 *  
 * A reference to the current parent component of this component, or `null`
 * if the component is not currently placed inside any containing component.
 *
 * If the component is a top-level component (added through
 * [[SGF.Game#addComponent]]) then [[SGF.Component#parent]] will be
 * [[SGF.Game.current]] (your game instance).
 **/
Component.prototype['parent'] = null;
Component.prototype['element'] = null;

Component.prototype['toString'] = functionReturnString("[object Component]");

makePrototypeClassCompatible(Component);

modules['component'] = Component;
