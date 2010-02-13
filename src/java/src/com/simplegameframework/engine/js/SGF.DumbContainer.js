SGF.DumbContainer = Class.create(SGF.Container, {
    getJavaComponent: function() {
        return new Packages.com.simplegameframework.engine.DumbContainer(this);
    }
});