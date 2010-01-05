/**
 * Space Invaders
 * --------------
 * A SGF port of the Java based Spaced Invaders found in the tutorial found
 * here: http://www.cokeandcode.com/spaceinvaderstutorial
 *
 * Use the Left and Right keys to move your ship left and right, and Button 1
 * to fire shots. The objective is to destroy all alien ships before they
 * shoot you!!!
 */

SI = {};
SI.game = SGF.Game.current;
SI.gameOver = false;

SGF.Screen.showNativeCursor(false);

SI.bg = new SGF.Rectangle({
    width:  SGF.Screen.getWidth(),
    height: SGF.Screen.getHeight(),
    zIndex: 0
});
SI.game.addComponent(SI.bg);

SI.game.loadScript("Ship.js", function() {
SI.game.loadScript("Alien.js", function() {
SI.game.loadScript("Shot.js", function() {
    
    SI.endGame = function() {
        SI.gameOver = true;
        SI.gameOverBg = new SGF.Rectangle({
            color:   "000000",
            width:   SGF.Screen.getWidth(),
            height:  SGF.Screen.getHeight(),
            opacity: .5,
            zIndex:  10
        });
        SI.game.addComponent(SI.gameOverBg);
    }


    SI.player = new SI.Ship({
        x: SGF.Screen.getWidth()/2
    });
    this.addComponent(SI.player);

    for (var i=5; i>0; i--) {
    //for (var i=0; i<5; i++) {
        var alien = new SI.Alien();
        alien.x = i * 50;
        this.addComponent(alien);
    }



});});});
