package com.simplegameframework.engine;

import java.awt.Color;
import java.awt.FontMetrics;
import java.awt.Graphics2D;

public abstract class Label extends Component {

    private java.awt.Font sizedFont;
    private float fontSize;
    private Color color;
    private String colorStr;

    @Override
    public void doRender(Graphics2D g, double interpolation, long renderCount) {
        super.doRender(g, interpolation, renderCount);

        float opacity = (float)__getOpacity();
        if (opacity <= 0.001) {
            return; // If the Component is invisible, then return without rendering anything!
        } else {
            g.setComposite(getAlphaComposite());
        }

        java.awt.Font font = __getFont().getFont();
        float size = __getSize();
        if (sizedFont == null || this.fontSize != size || (!font.getFontName().equals(sizedFont.getFontName()))) {
            recreateFont(font, size);
        }
        g.setColor(Color.white);
        g.setFont(sizedFont);
        FontMetrics metrics = g.getFontMetrics();

        // We need to handle all tab \t characters, replacing tabs with the
        // nearest tab interval (4 spaces).
        String tabFixed = "";
        char[] chars = __getText().toCharArray();
        int pos = 0, numSpaces, j;
        for (int i=0; i<chars.length; i++) {
            char ch = chars[i];
            if (ch == '\n') {
                pos = 0;
                tabFixed += ch;
            } else if (ch == '\t') {
                numSpaces = 4 - (pos % 4);
                for (j=0; j<numSpaces; j++) {
                    tabFixed += ' ';
                }
                pos += numSpaces;
            } else {
                pos++;
                tabFixed += ch;
            }
        }

        String[] lines = tabFixed.split("\n");

        double width = __getWidth();
        double height = __getHeight();

        this.currentRotationRad = __getRotation();
        boolean needToRotate = this.currentRotationRad % (Math.PI*2) != 0.0;
        if (needToRotate) {
            this.currentCenterX = currentFrameX + (width / 2d);
            this.currentCenterY = currentFrameY + (height / 2d);
            g.rotate(this.currentRotationRad, this.currentCenterX, this.currentCenterY);
        }


        g.setClip((int)currentFrameX, (int)currentFrameY, (int)width, (int)height);
        float xOffset;
        int align = __getAlign();
        String line;
        for (int i=0; i < lines.length; i++) {
            line = lines[i];
            xOffset = 0;
            if (align == 1) { // Center
                xOffset = ((float)width/2f) - ((float)metrics.stringWidth(line)/2f);
            } else if (align == 2) { // Right
                xOffset = (float)width - (float)metrics.stringWidth(line);
            }
            g.drawString(line, (float)(currentFrameX + xOffset), (float)(currentFrameY + (size*(i+1))));
        }
        g.setClip(null);


        if (needToRotate) {
            g.rotate(-this.currentRotationRad, this.currentCenterX, this.currentCenterY);
        }
    }

    private void recreateFont(java.awt.Font f, float size) {
        this.sizedFont = f.deriveFont(size);
        this.fontSize = size;
        System.out.println("Created Font '" + sizedFont.getFontName() + "' size " + size + "pt");
    }
    
    public abstract String __getText();
    public abstract Font __getFont();
    public abstract String __getColor();
    public abstract float __getSize();
    public abstract int __getAlign();

}
