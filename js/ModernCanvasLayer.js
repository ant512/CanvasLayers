/*
Copyright © 2023 Studiofy | Copyright © 2010 Antony Dzeryn

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
 * The concept of this ModernCanvasLayer.js is based on the concept of original canvaslayers.js.
 * It uses an array to collect objects and their properties and use it also to manage their z-indexes
 * 
 */

/**
 * @description The LayerContainer Class
 * @param _canvas is used to store the canvas element
 * @param _ctx is used to get the context of the canvas
 * @property {Layer[]} _layers is used to store the collection of canvas layer
 */
export default class LayerContainer
{
    _canvas;
    _ctx;

    _layers = [];


    /**
     * Initializes the canvas
     * @param Id The base canvas' ID
     * @param ctx The existing context of user (2D)
     * 
     */
    constructor(Id, ctx)
    {
        this._canvas = document.getElementById(Id);
        this._ctx = ctx ? this._canvas.getContext(ctx) : null;
        this._ctx.fillStyle = "white";
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }

    get2DContext() {
        return this._ctx;
    }

    /**
     * @description Displays the sorted layers based on their indexes
     */
    displayLayers(sorted)
    {
        let IsDisplaySorted = sorted ? true : false;
        if (IsDisplaySorted) {
            if (this._layers.length != 0) {
                const sortedLayers = this._layers.slice().sort((a, b) => a._index - b._index);
    
                this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    
                for (const layer of sortedLayers) {
                    if (layer._isLayerVisible) {
                        layer.drawShape(this._ctx);
                    }
                }
    
                console.log("Canvas ID: " + this._canvas.id + "\nLayers: " + JSON.stringify(sortedLayers, null, 2));
            }
            else {
                console.log("Canvas ID: " + this._canvas.id + "\nLayers: No Layers");
            }
        }
        else {
            if (this._layers.length != 0) {
                this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

                for (const layer of this._layers) {
                    if (layer._isLayerVisible) {
                        layer.drawShape(this._ctx);
                    }
                }
                console.log("Canvas ID: " + this._canvas.id + "\nLayers: " + JSON.stringify(this._layers, null, 2));
            }
            else {
                console.log("Canvas ID: " + this._canvas.id + "\nLayers: No Layers");
            }
        }
    }

    /**
     * @description Insert a new layer on the base canvas and
     * automatically calls the displayLayers() to update the container
     * @param {Layer} layer The item that will be added to the LayerContainer
     */
    addLayer(layer)
    {
        this._layers.push(layer);
    }

    /**
     * @description Selects a layer from the LayerContainer
     * @param {string} name 
     */
    selectLayer(name) {
        const selectedLayer = this._layers.find(layer => layer._name === name);
        if (selectedLayer != null) {
            return selectedLayer;
        }
        else {
            alert(`Layer with name "${name}" not found in the collection.`);
            return null;
        }
    }

    /**
     * @description Swap the indexes of the multiple selected layers
     * @param {Layer[]} layers Array of layers to be swapped using their indexes
     */
    swapIndex(...layers) {
        // if (firstLayer instanceof Layer && secondLayer instanceof Layer) {
        //     const tempIndex = firstLayer._index;
        //     firstLayer._index = secondLayer._index;
        //     secondLayer._index = tempIndex;
        // } else {
        //     alert("Layers are not an instance of Layer Class");
        // }
        for (let i = 1; i < layers.length; i++) {
            const currentLayer = layers[i];
            const previousLayer = layers[i - 1];
    
            if (currentLayer instanceof Layer && previousLayer instanceof Layer) {
                const tempIndex = currentLayer._index;
                currentLayer._index = previousLayer._index;
                previousLayer._index = tempIndex;
            }
        }
    }

    displayLayerThumbnail(layer, container) {
        let thumbnailCanvas = document.createElement("canvas");
        thumbnailCanvas.width = 100;
        thumbnailCanvas.height = 100;
        
        let thumbnailContext = thumbnailCanvas.getContext("2d");
        layer.drawThumbnail(thumbnailContext);

        let thumbnailElement = document.createElement("div");
        thumbnailElement.appendChild(thumbnailCanvas);
        container.appendChild(thumbnailElement);
    }
}

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
export class Layer
{
    _posX;
    _posY;
    _name;
    _width;
    _height;
    _index;
    _isLayerVisible;
    _isLayerMovable;
    _fillColor;
    _strokeColor;
    _type;

    constructor(x, y, name, width, height, index, fillColor, strokeColor, type) {
        this._posX = x;
        this._posY = y;
        this._name = name;
        this._width = width;
        this._height = height;
        this._index = index;
        this._isLayerVisible = true;
        this._isLayerMovable = false;
        this._fillColor = fillColor;
        this._strokeColor = strokeColor;
        this._type = type;
    }

    /**
     * @description Set the Layer if it is visible
     */
    toggleVisibility() {
        this._isLayerVisible = !this._isLayerVisible;
    }
    
    drawShape(ctx) {
        let context = ctx;

        context.fillStyle = this._fillColor; 
        context.strokeStyle = this._strokeColor; 

        context.beginPath();
        if (this._type === 'circle') {
            const radius = Math.min(this._width, this._height) / 2;
            context.arc(
                this._posX + radius, // X-coordinate of the circle's center
                this._posY + radius, // Y-coordinate of the circle's center
                radius, // Radius
                0, // Start angle (in radians)
                2 * Math.PI // End angle (in radians, for a full circle)
            );
        } else if (this._type === 'square') {
            context.rect(this._posX, this._posY, this._width, this._height);
        }
        context.fill();
        context.stroke();

        context.closePath();
        context.save();
        context = null;
    }
    
    drawImage(ctx, file) {
        let context = ctx;
    
        console.log("File path:", file); // Log the image path
        console.log("Canvas context:", context); // Log the canvas context

        if (context) {
            console.log("Canvas dimensions:", context.canvas.width, context.canvas.height); // Log the canvas dimensions
            
            context.beginPath();
            
            if (file) {
                const image = new Image();
                image.src = file;

                image.onload = function() {
                    console.log("Image loaded successfully");
                    context.drawImage(image, this._posX, this._posY, this._width, this._height);
                };

                image.onerror = function() {
                    console.error("Error loading the image.");
                };
            } else {
                console.error("File path is null or undefined.");
            }
            context.closePath();
            context.save();
        } else {
            console.error("Context is null or not initialized.");
        }
    }

    drawThumbnail(ctx) {
        let context = ctx;

        context.fillStyle = this._fillColor;
        context.strokeStyle = this._strokeColor;
        context.beginPath();
        context.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
        context.fill();
        context.stroke();
    }
}