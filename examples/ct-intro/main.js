(function() {
    var pendSpriteset = new SGF.Spriteset("pendulum.gif", 59, 210);
    var pendSprite = new SGF.Sprite(pendSpriteset, {
        width: pendSpriteset.spriteWidth,
        height: pendSpriteset.spriteHeight,
        y: 210
    });
    var pendContainer = new SGF.DumbContainer([pendSprite], {
        width: 59,
        height: 420,
        x: 200,
        y: -210,
        rotation: -1
    });
    pendContainer.update = function() {
        //this.rotation += (-9.8) * Math.sin(this.rotation);
        SGF.log(this.rotation);
    };
    SGF.Game.current.addComponent(pendContainer);
})();
