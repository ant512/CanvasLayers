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

export default class LayerElement {

    /**
     * Initializes a new CanvasLayer and add it to the _layerElements collection
     * @param {CanvasLayer} layer the parent layer of the Element
     */
    constructor(name = "New Element", width, height) {
        // Will be implemented after November 2, 2023
    }
    
    addToLayer(layer) {
        // Will be implemented after November 2, 2023
    }

}