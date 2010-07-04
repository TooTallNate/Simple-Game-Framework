/** section: Components API
 * class Rectangle < Shape
 *
 * A [[Component]] that renders a single rectangle onto the screen
 * as a solid color.
 **/
function Rectangle(options) {
    Shape.call(this, options);
}

inherits(Rectangle, Shape);
makePrototypeClassCompatible(Rectangle);

Rectangle.prototype['getElement'] = function() {
    this['__color'] = this['color'];
    var element = new Element("div");
    setStyleImportant(element, 'position', "absolute");
    setStyleImportant(element, 'background-color', "#" + this['color']);
    return element;
}

Rectangle.prototype['toString'] = functionReturnString("[object Rectangle]");

modules['rectangle'] = Rectangle;
