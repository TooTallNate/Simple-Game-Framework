package com.simplegameframework.engine;

import org.mozilla.javascript.Context;

/**
 * "Static" class that contains the SGF.log implementation.
 * @author Nathan Rajlich
 */
public class Log {
    public static void logFunction(Object p) {
        System.out.println(System.currentTimeMillis() + ": '" + Context.toString(p) + "'");
    }
}
