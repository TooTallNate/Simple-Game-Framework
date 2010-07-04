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
function DumbContainer(components, options) {
    var self = this;
    Container.call(self, components, options);
    self['__shouldUpdateComponents'] = self['__needsRender'] = false;
}

inherits(DumbContainer, Container);
makePrototypeClassCompatible(DumbContainer);

DumbContainer.prototype['addComponent'] = function(component) {
    Container.prototype['addComponent'].call(this, component);
    this['__needsRender'] = true;
    return this;
}

DumbContainer.prototype['removeComponent'] = function(component) {
    Container.prototype['removeComponent'].call(this, component);
    this['__needsRender'] = true;
    return this;
}

DumbContainer.prototype['render'] = function(renderCount) {
    if (this['width'] != this['__width'] || this['height'] != this['__height'])
        this['__needsRender'] = true;
    Container.prototype['render'].call(this, renderCount);
}

DumbContainer.prototype['__renderComponents'] = function(renderCount) {
    Container.prototype['__renderComponents'].call(this, renderCount);
    this['__needsRender'] = false;
}

DumbContainer.prototype['renderComponents'] = function() {
    this['__needsRender'] = true;
}


DumbContainer.prototype['toString'] = functionReturnString("[object DumbContainer]");

modules['dumbcontainer'] = DumbContainer;
