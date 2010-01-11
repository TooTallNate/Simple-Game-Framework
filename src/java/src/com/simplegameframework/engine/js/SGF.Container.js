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
        this.__component.add(component);
        return this;
    },
    
    removeComponent: function(component) {
        this.__component.remove(component);
        return this;
    },

    __shouldUpdateChildren: function() {
        return this.updateChildren === true;
    }

});

SGF.Container.DEFAULTS = {
    updateChildren: false
};
