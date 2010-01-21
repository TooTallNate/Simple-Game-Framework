BB.Brick = Class.create(SGF.Rectangle, {
    // Checks if this Brick is currently intersecting `component`
    checkHit: function(component) {
        if (component.left() >= this.left() && component.right() <= this.right() && component.top() <= this.bottom()) {
            this.hit();
            component.dy = Math.abs(component.dy);
        }
    },
    hit: function() {
        SGF.Game.current.removeComponent(this);
        BB.bricks = BB.bricks.without(this);
        if (BB.bricks.length == 0) {
            BB.gameOver();
        }
    }
});

BB.bricks = [];

BB.initBricks = function(array) {
    BB.brickRows = array.length;
    BB.brickCols = array.first().length;
    BB.brickWidth = (BB.GAME_WIDTH / BB.brickCols) -1;
    BB.brickHeight = 15;

    array.each(function(colArray, n) {
        colArray.each(function(oneOrZero, nn) {
            if (oneOrZero !== 1) return;
            
            BB.bricks.push(new BB.Brick({
                x: nn*(BB.brickWidth+1),
                y: n*(BB.brickHeight+1),
                width: BB.brickWidth,
                height: BB.brickHeight,
                color: "00" + (((n+5) / 20) * 255).round().toColorPart() + "00"
            }));
            SGF.Game.current.addComponent(BB.bricks.last());

        });
    });
};
