/** section: Components API
 * class SGF.Container < SGF.Component
 *
 * A `SGF.Container` is a concrete [[SGF.Component]] subclass, that acts
 * similar to the main [[SGF.Screen]] itself. That is, you can add
 * `SGF.Component`s into a container just like you would in your game.
 * Components placed inside containers are rendered with their attributes
 * relative to the Container's attributes. `SGF.Container` supports
 * all the regular [[SGF.Component]] properties (i.e. `width`, `height`, `x`,
 * `y`, `dx`, `dy`, `opacity`, `rotation`, and `zIndex`) Changing the properties
 * on a Container affect the global properties of the Components placed inside.
 **/


/**
 * new SGF.Container(components[, options])
 * - components (Array): An array of [[SGF.Component]]s that should initally
 *                       be placed into the container. This is a required
 *                       argument, however it can be an empty array. Also
 *                       note that you can add or remove `SGF.Component`s
 *                       at any time via [[SGF.Container#addComponent]] and
 *                       [[SGF.Container#removeComponent]].
 *                       
 * - options (Object): The optional 'options' object's properties are copied
 *                     this [[SGF.Container]] in the constructor. It allows all
 *                     the same default properties as [[SGF.Component]].
 *
 * Instantiates a new [[SGF.Container]], adding the [[SGF.Component]]s found
 * in `components` initially.
 **/
function Container(components, options) {
    if (components !== true) {
        var self = this;
        self['components'] = [];
        Component.call(self, options || {});
        if (Object['isArray'](components)) {
            components['each'](self['addComponent'], self);
        }
        this['__shouldUpdateComponents'] = this['__needsRender'] = true;
    }
}

Container.prototype = new Component(true);

Container.prototype['update'] = function(updateCount) {
    var self = this;
    
    // Not needed, since Component#update is empty
    //Component.prototype.update.call(self, updateCount);
    
    if (self['__shouldUpdateComponents']) {
        for (var i=0; i<self['components'].length; i++) {
            if (self['components'][i]['update'])
                self['components'][i]['update'](updateCount);
        }
    }
}

Container.prototype['render'] = function(renderCount) {
    var self = this;
    
    Component.prototype['render'].call(self, renderCount);
    
    if (self['__needsRender']) {
        self['__renderComponents'](renderCount);
    }
}

Container.prototype['__renderComponents'] = function(renderCount) {
    for (var i=0; i < this['components'].length; i++) {
        if (this['components'][i]['render'])
            this['components'][i]['render'](renderCount);
    }
}

/**
 * Container#addComponent(component) -> Container
 * - component (Component): The [[Component]] instance to add to this
 *                              container.
 *
 * Adds a [[Component]] into the container. `component`'s attributes
 * will be rendered to the screen in relation to the attributes of this `Container`.
 **/
Container.prototype['addComponent'] = function(component) {
    if (component.parent !== this) {
        if (component.parent)
            component.parent['removeComponent'](component);
        this['components'].push(component);
        this['element'].appendChild(component['element']);
        component.parent = this;
        component['__fixZIndex']();
    }
    return this;
}

/**
 * SGF.Container#removeComponent(component) -> SGF.Container
 * - component (SGF.Component): The `SGF.Component` instance to add to this
 *                              container.
 *
 * Removes an [[SGF.Component]] from the container that has previously been
 * added to this container via [[SGF.Container#addComponent]].
 **/
Container.prototype['removeComponent'] = function(component) {
    var index = this['components'].indexOf(component);
    if (index > -1) {
        arrayRemove(this['components'], index);
        this['element'].removeChild(component['element']);
        component.parent = null;
    }
    return this;
}

Container.prototype['__computeChildZIndex'] = function(zIndex) {
    return (parseInt(this.element.style.zIndex) || 0) + (parseInt(zIndex) || 0);
}

Container.prototype['__fixZIndex'] = function() {
    Component.prototype['__fixZIndex'].call(this);
    for (var i=0; i < this['components'].length; i++) {
        this['components'][i]['__fixZIndex']();
    }
}

Container.prototype['toString'] = functionReturnString("[object Container]");

makePrototypeClassCompatible(Container);

modules['container'] = Container;