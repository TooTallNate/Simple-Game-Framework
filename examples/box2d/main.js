SGF.Game.current.loadScript("box2d.min.js", function() {
    var gameSpeed = 30;
    SGF.Game.current.setGameSpeed(gameSpeed);
    SGF.Screen.color = "000001";

    // Create World
    var worldAABB = new b2AABB();
    worldAABB.minVertex.Set(-1000, -1000);
    worldAABB.maxVertex.Set(500, 500);
    var gravity = new b2Vec2(0, 300);
    var doSleep = true;
    var world = new b2World(worldAABB, gravity, doSleep);

    // Create Ground
    var groundSd = new b2BoxDef();
    groundSd.extents.Set(1000, 10);
    //groundSd.restitution = 0.2;
    var groundBd = new b2BodyDef();
    groundBd.AddShape(groundSd);
    groundBd.position.Set(0, 300);
    world.CreateBody(groundBd);

    var leftSd = new b2BoxDef();
    leftSd.extents.Set(10, 1000);
    //leftSd.restitution = 0.2;
    var leftBd = new b2BodyDef();
    leftBd.AddShape(leftSd);
    leftBd.position.Set(0, 0);
    world.CreateBody(leftBd);

    var rightSd = new b2BoxDef();
    rightSd.extents.Set(10, 1000);
    //leftSd.restitution = 0.2;
    var rightBd = new b2BodyDef();
    rightBd.AddShape(rightSd);
    rightBd.position.Set(400, 0);
    world.CreateBody(rightBd);

    var topSd = new b2BoxDef();
    topSd.extents.Set(1000, 10);
    //leftSd.restitution = 0.2;
    var topBd = new b2BodyDef();
    topBd.AddShape(topSd);
    topBd.position.Set(0, 0);
    world.CreateBody(topBd);

    // Create a Box
    var boxSd = new b2BoxDef();
    boxSd.density = 1.0;
    boxSd.extents.Set(8, 8);
    var boxBd = new b2BodyDef();
    boxBd.AddShape(boxSd);
    boxBd.position.Set(10, 10);
    var b = world.CreateBody(boxBd);

    var box = new SGF.Rectangle({
        width:16,
        height:16,
        color: "FFFFFF"
    });
    box.update = box.update.wrap(function($super, updateCount) {
        var t1 = (new Date).getTime();
        world.Step(1.0/gameSpeed, 1);
        var t2 = (new Date).getTime();



        $super(updateCount);
        this.opacity = b.IsSleeping() ? .5 : 1;

        var c = b.GetCenterPosition();
        this.x = c.x - (this.width/2);
        this.y = c.y - (this.height/2);
        this.rotation = b.GetRotation();
    });
    SGF.Game.current.addComponent(box);

    var label = new SGF.Label({
        width:100,
        height:50
    });
    var numBoxes = 1;
    function updateLabel() {
        numBoxes++;
        label.setText("Num Boxes:\t" + numBoxes);
    }
    SGF.Game.current.addComponent(label);
    function newBox(x, y) {
        // Create a Box
        var size = ((Math.random() * 18) + 2).round();
        var boxSd = new b2BoxDef();
        boxSd.density = 1.0;
        boxSd.friction = 0.2;
        boxSd.restitution = 1;
        boxSd.extents.Set(size/2, size/2);
        var boxBd = new b2BodyDef();
        boxBd.AddShape(boxSd);
        boxBd.position.Set(x, y);
        var a = world.CreateBody(boxBd);

        var box = new SGF.Rectangle({
            width: size,
            height: size,
            color: (Math.random()*255).round().toColorPart() +
                   (Math.random()*255).round().toColorPart() +
                   (Math.random()*255).round().toColorPart()
        });
        box.update = box.update.wrap(function($super, updateCount) {
            $super(updateCount);

            this.opacity = a.IsSleeping() ? .5 : 1;
            this.x = a.m_position.x - (this.width/2);
            this.y = a.m_position.y - (this.height/2);
            this.rotation = a.m_rotation;
        });
        box.update();
        SGF.Game.current.addComponent(box);
        //SGF.log("Box Size: " + size);
        updateLabel();
    }

    SGF.Input.observe("mousedown", function(e) {
        newBox(e.x, e.y);
    });

    (10).times(function() {
        newBox((Math.random() * 400)+10, (Math.random() * 200)+10);
    });
});
