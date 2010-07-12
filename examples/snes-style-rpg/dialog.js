(function() {
    var Container = SGF.require("Container");
    var DumbContainer = SGF.require("DumbContainer");
    var Sprite = SGF.require("Sprite");
    var Label = SGF.require("Label");
    var Font = SGF.require("Font");
    
    Container.prototype.pause = function() {
        this.__shouldUpdateComponents = false;
    }
    Container.prototype.resume = function() {
        this.__shouldUpdateComponents = true;
    }

    K.Dialog = Class.create(Container, {
        initialize: function($super, text) {
            var lines = text.split('\n'), maxLength = 0;
            lines.each(function(line) {
                if (line.length > maxLength) {
                    maxLength = line.length;
                }
            });
            //SGF.log(text, maxLength + "x" + lines.length);
            var layer = [], i=0; j=0, l=0, xLen = 0, yLen = 0;
            yLen = lines.length + 3;
            xLen = maxLength + 3;
            for (j=0; j<yLen;j++) {
                var line = [];
                for (i=0; i<xLen; i++) {
                    if (i===0 && j===0) {
                        line.push([0,0]);
                    } else if (j===0 && i===(xLen-1)) {
                        line.push([2,0]);
                    } else if (i===0 && j===(yLen-1)) {
                        line.push([0,2]);
                    } else if (j===(yLen-1) && i===(xLen-1)) {
                        line.push([2,2]);
                    } else if (j===0) {
                        line.push([1,0]);
                    } else if (i===0) {
                        line.push([0,1]);
                    } else if (j===(yLen-1)) {
                        line.push([1,2]);
                    } else if (i===(xLen-1)) {
                        line.push([2,1]);
                    } else {
                        line.push([1,1]);
                    } 
                }
                layer.push(line);
            }
            /*var layer = [
                [[0,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[2,0]],
                [[0,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[2,1]],
                [[0,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[2,1]],
                [[0,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[2,1]],
                [[0,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[2,1]],
                [[0,2],[1,2],[1,2],[1,2],[1,2],[1,2],[1,2],[1,2],[1,2],[1,2],[1,2],[2,2]]
            ];*/


            var tiles = [],
                yLen = layer.length,
                xLen = layer[0].length;

            for (j=0; j<yLen; j++) {
                for (l=0; l<xLen; l++) {
                    layer[j][l] = new Sprite(K.dialog, {
                        width: 7,
                        height: 7,
                        x: l*7,
                        y: j*7,
                        spriteX: layer[j][l][0],
                        spriteY: layer[j][l][1],
                        zIndex:10
                    });
                    tiles.push(layer[j][l]);
                }
            }

            var bg = new DumbContainer(tiles, {
                width: 7 * xLen,
                height: 7 * yLen
            });
        
            this.label = new Label({
                width: bg.width - 14,
                height: bg.height - 14,
                x: 7,
                y: 7,
                size: 12,
                font: new Font("Courier New"),
                zIndex:20
            });
            this.label.setText(text);

            $super([bg, this.label], {
                width: 7 * xLen,
                height: 7 * yLen,
                zIndex: 50
            });
        }
    });
})();
