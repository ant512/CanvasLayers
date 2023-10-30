/*
Copyright © 2023 Studiofy & Antony Dzeryn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

/**
 * 
 * The concept of CanvasLayerContainer/CanvasLayer/CanvasLayerElement is based on the concept of original canvaslayers.js.
 * It uses an array to collect objects and their properties and use it also to manage their z-indexes
 * 
 */

/**
 * @description The Layer Class
 * @param _posX stores the X Axis Position of the Layer
 * @param _posY stores the Y Axis Position of the Layer
 * @param _name stores the name of the Layer
 * @param _width stores the width of the Layer
 * @param _height stores the height of the Layer
 * @param _index stores the z-index of the Layer
 * @param _isLayerVisible stores the visibility of the Layer
 * @param _isLayerMovable stores the value whether the Layer is movable or not
 * @param _fillColor stores the fill color value of the Layer
 * @param _strokeColor stores the stroke color value of the Layer
 */
export default class CanvasLayer {

    _posX; _posY; _name;
    _width; _height; _index;
    _isLayerVisible; _isLayerMovable;
    _fillColor;

    _layerContents = [];

    constructor(name = "New Layer", width, height) {
        this.setName(name);
        this.setFillColor('white');
        this.setIndex(1);
        this.setLayerVisibility(true);
        this.setLayerMovability(false);
        this.setWidth(width);
        this.setHeight(height);
    }
    
    /**
     * Get the X Axis Position of the selected layer
     * @returns {number} x axis position of the selected layer
     */
    getPosX() {
        return this._posX;
    }

    /**
     * Set the X Axis Position of the selected layer
     * @param {number} posX 
     */
    setPosX(posX) {
        this._posX = posX;
    }

    /**
     * Get the Y Axis Position of the selected layer
     * @returns {number} y axis position of the selected layer
     */
    getPosY() {
        return this._posY;
    }

    setPosY(posY) {
        this._posY = posY;
    }

    getFillColor() {
        return this._fillColor;
    }

    setFillColor(fillColor) {
        this._fillColor = fillColor;
    }
    
    /**
     * Get the width of the selected layer
     * @returns {number} width
     */
    getWidth() {
        return this._width;
    }

    /**
     * Set the width of the selected layer
     * @param {number} width 
     */
    setWidth(width) {
        this._width = width;
    }

    /**
     * Get the height of the selected layer
     * @returns {number} height
     */
    getHeight() {
        return this._height;
    }

    setHeight(height) {
        this._height = height;
    }

    /**
     * Get the name of the selected layer
     * @returns {string} name
     */
    getName() {
        return this._name;
    }

    /**
     * Set the name of the selected layer
     * @param {string} name 
     */
    setName(name) {
        this._name = name;
    }

    /**
     * Get the index of the selected layer
     * 
     * The higher the number, the higher the index is
     * @returns {number} index
     */
    getIndex() {
        return this._index;
    }

    /**
     * Set the index of the selected layer
     * 
     * The higher the number, the higher the index is
     * @param {number} index 
     */
    setIndex(index) {
        this._index = index;
    }

    /**
     * Get the visibility of the selected layer
     * @returns {boolean} true if visible otherwise false
     */
    getLayerVisibility() {
        return this._isLayerVisible;
    }

    /**
     * Set the visibility of the selected layer
     * @param {boolean} isLayerVisible true if visible otherwise false
     */
    setLayerVisibility(isLayerVisible) {
        this._isLayerVisible = isLayerVisible;
    }

    /**
     * Get the state of the layer if it is movable or not
     * @returns {boolean} true if the layer is movable otherwise false
     */
    getLayerMovability() {
        return this._isLayerMovable;
    }

    /**
     * Set the state of the layer if it is movable or not
     * @param {boolean} isLayerMovable 
     */
    setLayerMovability(isLayerMovable) {
        this._isLayerMovable = isLayerMovable;
    }

    /**
     * Set the state of the layer based on the value of _isLayerVisibility
     */
    toggleLayerVisibility() {
        this.setLayerVisibility(!this.getLayerVisibility());
    }

    addContent(element) {
        this._layerContents.push(element);
    }

    /**
     * Draw a layer using the context of the canvas
     * @param {CanvasRenderingContext2D} ctx 
     */
    drawLayer(ctx) {
        let context = ctx;
        if (context) {
            context.fillStyle = this.getFillColor(); 
    
            context.beginPath();
            context.rect(this.getPosX(), this.getPosY(), this.getWidth(), this.getHeight());
    
            context.fill();
    
            context.closePath();
            context.save();
        }
    }
}