/** section: Components API
 * class SGF.DumbContainer < SGF.Container
 *
 * There are plenty of cases where a large amount of [[SGF.Component]]s are going
 * to be placed inside of a [[SGF.Container]], BUT NEVER CHANGE. This scenario
 * can be brought up by creating a tile based map using [[SGF.Sprite]]. Map's don't
 * change beyond their initialization (usually), so it's a waste of CPU to
 * re-render and check for updates of each individual tile, because we know that
 * they will never need to change. That very scenario is why [[SGF.DumbContainer]]
 * exists. Using a `DumbContainer`, all the tile sprites that were added to the
 * container will only be rendered once, and then re-blitted to the screen for
 * maximum speed.
 *
 * So in short, use [[SGF.DumbContainer]] when the components inside will never
 * need to be changed, and save a lot of processing power.
 **/
SGF.DumbContainer = Class.create(SGF.Container, {
    initialize: function($super, components, options) {
        $super(components, options);
        this.__shouldUpdateComponents = this.__needsRender = false;
    },

    addComponent: function($super, component) {
        $super(component);
        this.__needsRender = true;
        return this;
    },
    removeComponent: function($super, component) {
        $super(component);
        this.__needsRender = true;
        return this;
    },

    render: function($super, interpolation, renderCount) {
        if (this.width != this.__width || this.height != this.__height)
            this.__needsRender = true;
        $super(interpolation, renderCount);
    },
    __renderComponents: function($super, interpolation, renderCount) {
        $super(interpolation, renderCount);
        this.__needsRender = false;
    },

    renderComponents: function() {
        this.__needsRender = true;
    }
});
