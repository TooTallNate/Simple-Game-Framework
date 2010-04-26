SGF.Container = Class.create(SGF.Component, {
    initialize: function($super, components, options) {
        $super(Object.extend(Object.clone(SGF.Container.DEFAULTS), options || {}));
        if (Object.isArray(components)) {
            components.each(this.addComponent, this);
        }
    },
    getJavaComponent: function() {
        return new Packages.com.simplegameframework.engine.Container(this);
    },

    addComponent: function(component) {
        if (component.parent !== this) {
            if (component.parent) {
                // The component was already inserted into a different
                // container, so we must remove it from there first 
                component.parent.removeComponent(component);
            }
            this.__component.add(component);
            component.parent = this;
        }
        return this;
    },
    
    removeComponent: function(component) {
        this.__component.remove(component);
        component.parent = null;
        return this;
    }
});

SGF.Container.DEFAULTS = {
    //updateChildren: false
};
