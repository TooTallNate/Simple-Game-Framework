/** section: Components API
 * class SGF.Container
 *
 * A `SGF.Container` is a concrete [[SGF.Component]] subclass, that acts
 * similar to the main [[SGF.Screen]] itself. That is, you can add
 * `SGF.Component`s into a container just like you would in your game.
 * Components placed inside containers are renders with their X and Y coordinates
 * relative to the Container's X and Y coordinates. `SGF.Container` supports
 * all the regular [[SGF.Component]] properties. I.e. `width`, `height`, `x`,
 * `y`, `dx`, `dy`, `opacity`, `rotation`, and `zIndex`. Changing the properties
 * on a Container affect the global properties of the Components placed inside.
 **/
SGF.Container = Class.create(SGF.Component, {
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
        $super(Object.extend(Object.clone(SGF.Container.DEFAULTS), options || {}));
        this.components = [];
        if (Object.isArray(components)) {
            components.each(this.addComponent, this);
        }
    },
    getElement: function() {
        return new Element("div").setStyle({
            position: "absolute",
            overflow: "hidden"
        });
    },
    update: function($super, updateCount) {
        $super(updateCount);
        if (this.updateChildren) {
            for (var i=0; i<this.components.length; i++) {
                this.components[i].update(updateCount);
            }
        }
    },
    render: function($super, interpolation, renderCount) {
        $super(interpolation, renderCount);
        for (var i=0; i < this.components.length; i++) {
            this.components[i].render(interpolation, renderCount);
        }
    },

    /**
     * SGF.Container#addComponent(component) -> SGF.Container
     * - component (SGF.Component): The `SGF.Component` instance to add to this
     *                              container.
     *
     * Adds an [[SGF.Component]] into the container. `component`'s attributes
     * will be rendered relative to the attributes of this `SGF.Container`.
     **/
    addComponent: function(component) {
        if (!this.components.include(component)) {
            this.components.push(component);
            this.element.insert(component);
        }
        return this;
    },
    
    removeComponent: function(component) {
        if (this.components.include(component)) {
            this.components = this.components.without(component);
            component.toElement().remove();
        }
        return this;
    }
});

SGF.Container.DEFAULTS = {
    updateChildren: false
};
