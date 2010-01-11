/**
 * Space Invaders
 * --------------
 * A SGF port of the Java based Spaced Invaders found in the tutorial here:
 *     http://www.cokeandcode.com/spaceinvaderstutorial
 *
 * Use the Left and Right keys to move your ship left and right, and Button 1
 * to fire shots. The objective is to destroy all alien ships before they
 * shoot you!!!
 */

SI = {};
SI.game = SGF.Game.current;
SI.gameOver = false;

SGF.Screen.useNativeCursor(false);
SGF.Screen.color = "000000";


SI.game.loadScript("Ship.js", function() {
SI.game.loadScript("Alien.js", function() {
SI.game.loadScript("Shot.js", function() {
    
    SI.endGame = function() {
        SI.gameOver = true;
        SI.gameOverBg = new SGF.Rectangle({
            color:   "000000",
            width:   SGF.Screen.width,
            height:  SGF.Screen.height,
            opacity: .5,
            zIndex:  10
        });
        SI.game.addComponent(SI.gameOverBg);
    }


    SI.player = new SI.Ship();
    SI.player.x = SGF.Screen.width / 2;
    this.addComponent(SI.player);

    for (var i=5; i>0; i--) {
    //for (var i=0; i<5; i++) {
        var alien = new SI.Alien();
        alien.x = i * 50;
        this.addComponent(alien);
    }



});});});
