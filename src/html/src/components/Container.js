/** section: Components API
 * class Container < Component
 *
 * A `Container` is a concrete [[Component]] subclass, that acts
 * similar to the main [[Screen]] itself. That is, you can add
 * `Component`s into a container just like you would in your game.
 * Components placed inside containers are rendered with their attributes
 * relative to the Container's attributes. `Container` supports
 * all the regular [[Component]] properties (i.e. `width`, `height`, `x`,
 * `y`, `opacity`, `rotation`, and `zIndex`). Changing the properties
 * on a Container affect the global properties of the Components placed inside.
 **/

/**
 * new Container(components[, options])
 * - components (Array): An array of [[Component]]s that should initally
 *                       be placed into the container. This is a required
 *                       argument, however it can be an empty array. Also
 *                       note that you can add or remove `Component`s
 *                       at any time via [[Container#addComponent]] and
 *                       [[Container#removeComponent]].
 *                       
 * - options (Object): The optional 'options' object's properties are copied
 *                     this [[Container]] in the constructor. It allows all
 *                     the same default properties as [[Component]].
 *
 * Instantiates a new [[Container]], adding the [[Component]]s found
 * in `components` initially.
 **/
function Container(components, options) {
    var self = this;
    self['components'] = [];
    Component.call(self, options || {});
    if (Object['isArray'](components)) {
        components['each'](self['addComponent'], self);
    }
    this['__shouldUpdateComponents'] = this['__needsRender'] = true;
}

inherits(Container, Component);
makePrototypeClassCompatible(Container);

Container.prototype['update'] = function(updateCount) {
    if (this['__shouldUpdateComponents']) {
        for (var components = arrayClone(this['components']),
                i=0,
                component=null,
                length = components['length']; i < length; i++) {

            component = components[i];
            if (component['update']) {
                component['update'](updateCount);
            }
        }
    }
}

Container.prototype['render'] = function(renderCount) {
    Component.prototype['render'].call(this, renderCount);
    if (this['__needsRender']) {
        this['__renderComponents'](renderCount);
    }
}

Container.prototype['__renderComponents'] = function(renderCount) {
    for (var components = arrayClone(this['components']),
            i=0,
            component = null,
            length = components['length']; i < length; i++) {

        component = components[i];
        if (component['render']) {
            component['render'](renderCount);
        }
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
        if (component.parent) {
            component.parent['removeComponent'](component);
        }
        this['components'].push(component);
        this['element'].appendChild(component['element']);
        component.parent = this;
        component['__fixZIndex']();
    }
    return this;
}

/**
 * Container#removeComponent(component) -> Container
 * - component (Component): The `Component` instance to remove frmo this
 *                          container.
 *
 * Removes a [[Component]] from the container that has previously been
 * added to this container via [[Container#addComponent]].
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

modules['container'] = Container;
