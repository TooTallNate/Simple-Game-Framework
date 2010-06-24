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
var Container = Class.create(Component, {
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
    initialize: function($super, components, options) {
        this.components = [];
        $super(Object.extend(this, options || {}));
        if (Object.isArray(components)) {
            components.each(this.addComponent, this);
        }
        this.__shouldUpdateComponents = this.__needsRender = true;
    },
    update: function($super, updateCount) {
        $super(updateCount);
        if (this.__shouldUpdateComponents) {
            for (var i=0; i<this.components.length; i++) {
                if (this.components[i].update)
                    this.components[i].update(updateCount);
            }
        }
    },
    render: function($super, renderCount) {
        $super(renderCount);
        if (this.__needsRender) {
            this.__renderComponents(renderCount);
        }
    },
    __renderComponents: function(renderCount) {
        for (var i=0; i < this.components.length; i++) {
            if (this.components[i].render)
                this.components[i].render(renderCount);
        }
    },


    /**
     * SGF.Container#addComponent(component) -> SGF.Container
     * - component (SGF.Component): The `SGF.Component` instance to add to this
     *                              container.
     *
     * Adds an [[SGF.Component]] into the container. `component`'s attributes
     * will be rendered in relation to the attributes of this `SGF.Container`.
     **/
    addComponent: function(component) {
        if (component.parent !== this) {
            if (component.parent)
                component.parent.removeComponent(component);
            this.components.push(component);
            this.element.appendChild(component.element);
            component.parent = this;
            component.__fixZIndex();
        }
        return this;
    },
    
    /**
     * SGF.Container#removeComponent(component) -> SGF.Container
     * - component (SGF.Component): The `SGF.Component` instance to add to this
     *                              container.
     *
     * Removes an [[SGF.Component]] from the container that has previously been
     * added to this container via [[SGF.Container#addComponent]].
     **/
    removeComponent: function(component) {
        var index = this.components.indexOf(component);
        if (index > -1) {
            arrayRemove(this.components, index);
            component.element.remove();
            component.parent = null;
        }
        return this;
    },
    __computeChildZIndex: function(zIndex) {
        return (parseInt(this.element.style.zIndex) || 0) + (parseInt(zIndex) || 0);
    },
    __fixZIndex: function($super) {
        $super();
        for (var i=0; i < this.components.length; i++) {
            this.components[i].__fixZIndex();
        }
    }
});

modules['container'] = Container;