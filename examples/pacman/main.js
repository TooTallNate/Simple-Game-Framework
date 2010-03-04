SGF.Game.current.setGameSpeed(30);

SGF.Screen.color = "555555";
SGF.Screen.useNativeCursor("none");

Number.prototype.toRadians = function() {
    return this * (Math.PI/180);
}

// Pacman Namespace
P = {};
P.gameStarted = false;
P.TILE_WIDTH = P.TILE_HEIGHT = 16;

SGF.Game.current.loadScript("Pacman.js", function() {
    SGF.Game.current.loadScript("Enemy.js", function() {
        SGF.Game.current.loadScript("Viewport.js", function() {

            


            
            this.addComponent(P.Viewport);
        });
    });
});
