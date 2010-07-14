package com.simplegameframework.launcher;

import javax.swing.JFrame;

public class Launcher extends JFrame {
    public Launcher() {
        
    }
    
    
    public static void main(String[] args) {
        java.awt.EventQueue.invokeLater(new Runnable() {
            public void run() {
                Launcher l = new Launcher();
                l.setVisible(true);
            }
        });
    }
}
