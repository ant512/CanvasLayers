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

import CanvasLayer from './CanvasLayer.js';

/**
 * @description The LayerContainer Class
 * @property _canvas is used to store the canvas element
 * @property _ctx is used to get the context of the canvas
 * @property _layers is used to store the collection of canvas layer
 */
export default class ParentContainer
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
        this.setCanvas(document.getElementById(Id));
        this.set2DContext(ctx);
    }

    get2DContext() {
        return this._ctx;
    }

    set2DContext(ctx) {
        this._ctx = this.getCanvas().getContext(ctx);
    }

    getCanvas() {
        return this._canvas;
    }

    setCanvas(canvas) {
        this._canvas = canvas;
    }

    getLayers() {
        return this._layers;
    }

    /**
     *  Displays the sorted layers based on their indexes
     * @param {boolean} sorted true to display layers based on their index or false to display layers based on their arrangement
     */
    displayLayers(sorted)
    {
        let IsDisplaySorted = sorted ? true : false;

        if (IsDisplaySorted && layerContainerDOM) {
            if (this._layers.length != 0) {
                const sortedLayers = this._layers.slice().sort((a, b) => a._index - b._index);
                this.get2DContext().clearRect(0, 0, this.getCanvas().width, this.getCanvas().height);
    
                for (const layer of sortedLayers) {
                    if (layer._isLayerVisible) {
                        layer.drawLayer(this._ctx);
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
                this.get2DContext().clearRect(0, 0, this.getCanvas().width, this.getCanvas().height);

                for (const layer of this._layers) {
                    if (layer._isLayerVisible) {
                        layer.drawLayer(this._ctx);
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
    swapLayerIndex(...layers) {
        for (let i = 1; i < layers.length; i++) {
            const currentLayer = layers[i];
            const previousLayer = layers[i - 1];
    
            if (currentLayer instanceof CanvasLayer && previousLayer instanceof CanvasLayer) {
                const tempIndex = currentLayer.getIndex();
                currentLayer.setIndex(previousLayer.getIndex());
                previousLayer.setIndex(tempIndex);
            }
        }
    }
}