// first, create a sprite layer to hold our text sprite
var plane = new SGF.SpriteLayer();
SGF.Screen.attach(plane);

// now, create our text sprite
var tsprite = new SGF.TextSprite();
tsprite.setFont('AbductionII_32pt_Green.png');
//tsprite.setTableSize( 5, 2 );
//tsprite.setTracking( 1.0, 1.0 );
tsprite.x = 50;
tsprite.y = 50;

// our logic function is called for each iteration through the logic loop
// here we just increment a counter which is displayed inside the sprite
tsprite.logic = function(clock) {
  this.setString( 0, 1, clock );
};

// this places the sprite in the world
plane.attach( tsprite );

// this is just a static text string
tsprite.setString( 0, 0, "HELLO" );

SGF.Game.current.observe('mousemove', function() {
  // each time the mouse moves, this event is fired
  // move our sprite to be centered under the mouse pointer.
  var pt = SGF.Screen.getMouseCoords();
  if (pt) {
     tsprite.x = pt.x - ((32 * 5) / 2);
     tsprite.y = pt.y - ((32 * 2) / 2);
  }

});