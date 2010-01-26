/** section: Networking API
 * class SGF.Server
 *
 * Acts as a server to maintain connections between multiple instances of your
 * game (and possibly even different game clients!).
 *
 * Underneath the hood, [[SGF.Server]] is intended to implement a WebSocket
 * server that rejects anything but valid WebSocket connection requests.
 *
 * Using this class is useful for game client to game client communication. It
 * is entirely possible, however, to write a more dedicated server for your
 * game using a dedicated WebSocket server. You would need to
 * <a href="http://github.com/TooTallNate/Java-WebSocket#readme">Write
 * Your Own WebSocket Server</a>. You would be more likely able to hard-code
 * the server address at that point in your game, making it more seamless for
 * your users.
 **/
SGF.Server = Class.create({
    initialize: function() {
        throw "The HTML/DOM client is not capable of starting a Server.";
    }
});

/**
 * SGF.Server.canServe -> Boolean
 *
 * Use this property to determine whether or not the current game client engine
 * has implemented [[SGF.Server]]. This value, for instance, is `false` on web
 * browser based game engines, as a web browser is not capable of starting it's
 * own WebSocket server. On the Java game engine, this value is `true`, as Java
 * has a WebSocket server written for it that can be used by your game.
 *
 *     if (SGF.Server.canServe) {
 *         var server = new SGF.Server();
 *         server.start();
 *     }
 **/
SGF.Server.canServe = false;