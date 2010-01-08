SGF.Sprite = Class.create(SGF.Component, {
    initialize: function($super, spriteset, options) {
        $super(Object.extend(Object.clone(SGF.Sprite.DEFAULTS), options || {}));
        this.spriteset = spriteset;
    },
    getJavaComponent: function() {
        return new Packages.com.simplegameframework.engine.Sprite(this);
    },
    
    __getSpriteset: function() {
        return this.spriteset;
    },
    __getSpriteX: function() {
        return this.spriteX;
    },
    __getSpriteY: function() {
        return this.spriteY;
    }
});

SGF.Sprite.DEFAULTS = {
    spriteX: 0,
    spriteY: 0
};