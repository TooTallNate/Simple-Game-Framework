SGF.Screen.showNativeCursor(false);

SGF.Input.observe('mousemove', function(obj) {
  // each time the mouse moves, this event is fired
  // move our sprite to be centered under the mouse pointer.
  console.log(obj);

});


var s = new SGF.Rectangle({
    color:"Blue"
});
SGF.Game.current.components.push(s);




var offset = $("screen").cumulativeOffset();

$("screen").observe("mousemove", function(e) {
    e.stop();
    s.x = e.pointerX() - offset.left;
    s.y = e.pointerY() - offset.top;
}).observe("mousedown", function(e) {
    e.stop();
    console.log(e);
}).observe("mouseup", function(e){
    e.stop();
    console.log('Left: ' + e.isLeftClick() + ", Middle: " + e.isMiddleClick() + ", Right: " + e.isRightClick());
}).observe("contextmenu", function(e) {
    e.stop();
});