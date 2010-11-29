var CanvasLayers = {

	/**
	 * Defines a basic layer.
	 * @param x The x co-ordinate of the layer, relative to its parent.
	 * @param y The y co-ordinate of the layer, relataive to its parent.
	 * @param width The width of the layer.
	 * @param height The height of the layer.
	 */
	Layer: function(x, y, width, height) {
		this.parent = null;				// Parent layer
		this.visible = true;			// Visible or hidden
		this.canvas = null;				// Drawing space
		
		this.rect = new CanvasLayers.Rectangle(x, y, width, height);
		this.children = new CanvasLayers.LayerCollection(this);
		
		this.onRender = null;
	},
		
	/**
	 * Rectangle class.
	 * @param x The x co-ordinate of the rectangle.
	 * @param y The y co-ordinate of the rectangle.
	 * @param width The width of the rectangle.
	 * @param height The height of the rectangle.
	 */
	Rectangle: function(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	},
		
	/**
	 * List of layers.
	 * @param Layer The layer that contains the list.
	 */
	LayerCollection: function(layer) {
		this.list = new Array();
		this.layer = layer;
	},
	
	/**
	 * Manages the list of damaged rectangles.
	 * @param Layer This should always be the top-level layer.
	 */
	DamagedRectManager: function(layer) {
		this.layer = layer;
		this.damagedRects = new Array();
	},
	 
	
	/**
	 * Top-level layer that contains the rest of the structure.  An instance of
	 * this should be created in order to create a layer system.
	 * @param canvas The canvas on which the system will be displayed.
	 */
	Container: function(canvas) {

		// Call base constructor
		CanvasLayers.Layer.prototype.constructor.call(this, 0, 0, canvas.width, canvas.height);
		
		this.canvas = canvas;
		
		this.damagedRectManager = new CanvasLayers.DamagedRectManager(this);
		
		// Ensure that the damaged rect manager knows to redraw this layer
		this.damagedRectManager.addDamagedRect(this.rect);
	}
}



/** DamagedRectManager Methods **/

/**
 * Add a damaged rect to the list.  The method automatically clips and splits
 * the rect to ensure that only new regions are added to the list.
 * @param rect The rect to add to the list.
 */
CanvasLayers.DamagedRectManager.prototype.addDamagedRect = function(rect) {
	var newRects = new Array();
	var remainingRects = new Array();

	newRects.push(rect);

	// Ensure that the new rect does not overlap any existing rects - we only
	// want to draw each region once
	for (var i = 0; i < this.damagedRects.length; ++i) {
		for (var j = 0; j < newRects.length; ++j) {
		
			var intersection = this.damagedRects[i].splitIntersection(newRects[j], remainingRects);

			if (intersection) {
			
				// Intersection contains the part of the new rect that is already known to be damaged
				// and can be discarded.  remainingRects contains the rects that still need to be examined
				newRects.splice(j, 1);
				j--;

				// Insert non-overlapping rects to the front of the array so that they are not
				// examined again for this particular damaged rect
				for (var k = 0; k < remainingRects.length; ++k) {
				
					newRects.unshift(remainingRects[k]);
					j++;
				}

				remainingRects = new Array();
			}
		}
	}

	// Add any non-overlapping rects into the damaged rect array
	for (var i = 0; i < newRects.length; ++i) {
		this.damagedRects.push(newRects[i]);
	}
}

/**
 * Redraws all damaged rects.
 */
CanvasLayers.DamagedRectManager.prototype.redraw = function() {
	this.drawRects(this.layer, this.damagedRects);
}

/**
 * Redraws the specified list of damaged rects for the specified layer.  The
 * function will recursively call itself in order to draw the layer and its
 * children in such a way as to minimise redrawing.  The algorithm looks like
 * this:
 * - Work out which parts of the damagedRects array intersect the current
 *   layer and remove them from the damagedRects array.
 * - Recursively call the method for each of the layer's children, sending the
 *   intersecting regions as a new array.
 * - Receive back from children any undrawn areas in the new array.
 * - Redraw all rects in the new array.
 * @param Layer The layer to redraw.
 * @param damagedRects An array of rectangles that must be redrawn.
 */
CanvasLayers.DamagedRectManager.prototype.drawRects = function(layer, damagedRects) {

	if (!layer.isVisible()) return;
	if (damagedRects.length == 0) return;

	var layerRect = layer.getRectClippedToHierarchy();
	
	var remainingRects = new Array();
	var subRects = new Array();
	
	// Work out which of the damaged rects collide with the current layer
	for (var i = 0; i < damagedRects.length; ++i) {
		var damagedRect = damagedRects[i];
		
		// Work out which part of the damaged rect intersects the current layer
		var intersection = layerRect.splitIntersection(damagedRect, remainingRects);
		
		if (intersection) {
			damagedRects.splice(i, 1);
			i--;
			
			// Add the non-intersecting parts of the damaged rect back into the
			// list of undrawn rects
			for (var j = 0; j < remainingRects.length; ++j) {
				damagedRects.unshift(remainingRects[j]);
				i++;
			}
			
			remainingRects = new Array();
			
			// Get children to draw all parts of themselves that intersect the
			// intersection we've found.
			subRects.push(intersection);
			
			for (var j = layer.children.length() - 1; j >= 0; --j) {
				this.drawRects(layer.children.at(j), subRects);
				
				// Abort if all rects have been drawn
				if (subRects.length == 0) break;
			}
			
			// Children have drawn themselves; anything left in the subRects
			// array must overlap this layer
			for (var j = 0; j < subRects.length; ++j) {
				layer.render(subRects[j]);
			}
			
			subRects = new Array();
		}
	}
}


/** Rect Methods **/

/**
 * Gets the co-ordinate of the rectangle's right edge.
 * @return The co-ordinate of the rectangle's right edge.
 */
CanvasLayers.Rectangle.prototype.getX2 = function() {
	return this.x + this.width - 1;
}

/**
 * Gets the co-ordinate of the rectangle's bottom edge.
 * @return The co-ordinate of the rectangle's bottom edge.
 */
CanvasLayers.Rectangle.prototype.getY2 = function() {
	return this.y + this.height - 1;
}

/**
 * Gets the intersect of this rectangle with the supplied argument.
 * @param rect The rectangle to intersect with this.
 * @return A rectangle that represents the intersection of the two rectangles.
 */
CanvasLayers.Rectangle.prototype.getIntersect = function(rect) {
	var x1 = this.x > rect.x ? this.x : rect.x;
	var y1 = this.y > rect.y ? this.y : rect.y;

	var x2 = this.getX2() < rect.getX2() ? this.getX2() : rect.getX2();
	var y2 = this.getY2() < rect.getY2() ? this.getY2() : rect.getY2();

	return new CanvasLayers.Rectangle(x1, y1, x2 - x1 + 1, y2 - y1 + 1);
}

/**
 * Gets the smallest rectangle capable of containing this rect and the supplied
 * argument.
 * @param rect The rectangle to add to this.
 * @return The smallest rectangle that can contain this rect and the argument.
 */
CanvasLayers.Rectangle.prototype.getAddition = function(rect) {
	var x1 = x < rect.x ? this.x : rect.x;
	var y1 = y < rect.y ? this.y : rect.x;

	var x2 = this.getX2() > rect.getX2() ? this.getX2() : rect.getX2();
	var y2 = this.getY2() > rect.getY2() ? this.getY2() : rect.getY2();

	return new CanvasLayers.Rectangle(x1, y1, x2 - x1 + 1, y2 - y1 + 1);
}

/**
 * Clips this rectangle to the intersection with the supplied argument.
 * @param rect The rectangle to clip to.
 */
CanvasLayers.Rectangle.prototype.clipToIntersect = function(rect) {
	var clipped = this.getIntersect(rect);

	this.x = clipped.x;
	this.y = clipped.y;
	this.width = clipped.width;
	this.height = clipped.height;
}

/**
 * Increases the size of the rect to encompass the supplied argument.
 * @param rect The rect to encompass.
 */
CanvasLayers.Rectangle.prototype.expandToInclude = function(rect) {
	var addition = getAddition(rect);

	this.x = addition.x;
	this.y = addition.y;
	this.width = addition.width;
	this.height = addition.height;
}

/**
 * Check if the rectangle has valid dimensions.
 * @return True if the rectangle has valid dimensions.
 */
CanvasLayers.Rectangle.prototype.hasDimensions = function() {
	if (this.width < 1) return false;
	if (this.height < 1) return false;
	return true;
}

/**
 * Check if this rectangle intersects the argument.
 * @param rect The rect to check for an intersection.
 * @return True if the rects intersect.
 */
CanvasLayers.Rectangle.prototype.intersects = function(rect) {
	return ((this.x + this.width > rect.x) &&
			(this.y + this.height > rect.y) &&
			(this.x < rect.x + rect.width) &&
			(this.y < rect.y + rect.height));
}

/**
 * Check if this rectangle contains the argument co-ordinate.
 * @param x The x co-ordinate to check.
 * @param y The y co-ordinate to check.
 * @return True if this rect contains the argument co-ordinate.
 */
CanvasLayers.Rectangle.prototype.contains = function(x, y) {
	return ((x >= this.x) &&
			(y >= this.y) &&
			(x < this.x + this.width) &&
			(y < this.y + this.height));
}

/**
 * Splits the rect argument into the area that overlaps this rect (this is
 * the return value) and an array of areas that do not overlap (this is the
 * remainderRects argument, which must be passed as an empty array).
 * @param rect The rectangle to intersect with this.
 * @param remainderRects An empty array that will be populated with the areas
 * of the rect parameter that do not intersect with this rect.
 * @return The intersection of this rectangle and the rect argument.
 */
CanvasLayers.Rectangle.prototype.splitIntersection = function(rect, remainderRects) {

	if (!this.intersects(rect)) return null;
	
	// Copy the properties of rect into intersection; we trim this to size later
	var intersection = new CanvasLayers.Rectangle(rect.x, rect.y, rect.width, rect.height);

	// Check for a non-overlapped rect on the left
	if (intersection.x < this.x) {
		var left = new CanvasLayers.Rectangle(0, 0, 0, 0);
		left.x = intersection.x;
		left.y = intersection.y;
		left.width = this.x - intersection.x;
		left.height = intersection.height;
		
		// Insert the rect
		remainderRects.push(left);
		
		// Adjust the dimensions of the intersection
		intersection.x = this.x;
		intersection.width -= left.width;
	}
	
	// Check for a non-overlapped rect on the right
	if (intersection.x + intersection.width > this.x + this.width) {
		var right = new CanvasLayers.Rectangle(0, 0, 0, 0);
		right.x = this.x + this.width;
		right.y = intersection.y;
		right.width = intersection.width - (this.x + this.width - intersection.x);
		right.height = intersection.height;
		
		// Insert the rect
		remainderRects.push(right);
		
		// Adjust dimensions of the intersection
		intersection.width -= right.width;
	}
	
	// Check for a non-overlapped rect above
	if (intersection.y < this.y) {
		var top = new CanvasLayers.Rectangle(0, 0, 0, 0);
		top.x = intersection.x;
		top.y = intersection.y;
		top.width = intersection.width;
		top.height = this.y - intersection.y;
		
		// Insert the rect
		remainderRects.push(top);
		
		// Adjust the dimensions of the intersection
		intersection.y = this.y;
		intersection.height -= top.height;
	}
	
	// Check for a non-overlapped rect below
	if (intersection.y + intersection.height > this.y + this.height) {
		var bottom = new CanvasLayers.Rectangle(0, 0, 0, 0);
		bottom.x = intersection.x;
		bottom.y = this.y + this.height;
		bottom.width = intersection.width;
		bottom.height = intersection.height - (this.y + this.height - intersection.y);
		
		// Insert the rect
		remainderRects.push(bottom);
		
		// Adjust dimensions of the intersection
		intersection.height -= bottom.height;
	}
	
	return intersection;
}


/** LayerCollection Methods **/

/**
 * Add a layer to the end of the collection.
 * @param layer The layer to add to the collection.
 */
CanvasLayers.LayerCollection.prototype.add = function(layer) {
	layer.parent = this.layer;
	this.list.push(layer);
	
	layer.markRectsDamaged();
}

/**
 * Insert a layer at the start of the collection.
 * @param layer The layer to insert into the collection.
 */
CanvasLayers.LayerCollection.prototype.insert = function(layer) {
	layer.parent = this.layer;
	this.list.splice(0, 0, layer);

	layer.markRectsDamaged();	
}

/**
 * Remove a layer from the collection.
 * @param layer The layer to remove from the collection.
 */
CanvasLayers.LayerCollection.prototype.remove = function(layer) {
	var index = this.getLayerIndex(layer);
	if (index > -1) {
		this.list.splice(index, 1);
	}
	
	layer.markRectsDamaged();
	
	layer.parent = null;
}

/**
 * Get the number of layers in the collection.
 * @return The number of layers in the collection.
 */
CanvasLayers.LayerCollection.prototype.length = function() { return this.list.length; }
		
/**
 * Get the layer at the specified index.
 * @return The layer at the specified index.
 */
CanvasLayers.LayerCollection.prototype.at = function(index) { return this.list[index]; }
		

/**
 * Raise the specified layer to the top (ie. end) of the collection.
 * @param layer The layer to raise to the top of the collection.
 */
CanvasLayers.LayerCollection.prototype.raiseToTop = function(layer) {		
	var index = this.getLayerIndex(layer);
	if (index > -1) {
		this.list.splice(index, 1);
		this.add(layer);
	}
}

/**
 * Lower the specified layer to the bottom (ie. start) of the collection.
 * @param layer The layer to lower to the bottom of the collection.
 */
CanvasLayers.LayerCollection.prototype.lowerToBottom = function(layer) {
	var index = this.getLayerIndex(layer);
	if (index > -1) {
		this.list.splice(index, 1);
		this.insert(layer)
	}
}
		
/**
 * Locate layer in list.
 * @param layer The layer to find.
 * @return The index of the layer, or -1 if the layer is not found.
 */
CanvasLayers.LayerCollection.prototype.getLayerIndex = function(layer) {
	for (var i in this.list) {
		if (this.list[i] == layer) {
			return i;
		}
	}
	
	return -1;
}


/** Layer Methods **/

/**
 * Gets the x co-ordinate of the layer relative to the top-level layer.
 * @return The x co-ordinate of the layer relative to the top-level layer.
 */
CanvasLayers.Layer.prototype.getX = function() {
	if (this.parent != null) {
		return this.rect.x + this.parent.getX();
	}
	
	return this.rect.x;
}

/**
 * Gets the y co-ordnate of the layer relative to the top-level layer.
 * @return The y co-ordinate of the layer relative to the top-level layer.
 */
CanvasLayers.Layer.prototype.getY = function() {
	if (this.parent != null) {
		return this.rect.y + this.parent.getY();
	}
	
	return this.rect.y;
}

/**
 * Gets the width of the layer.
 * @return The width of the layer.
 */
CanvasLayers.Layer.prototype.getWidth = function() { return this.rect.width; }

/**
 * Gets the height of the layer.
 * @return The height of the layer.
 */
CanvasLayers.Layer.prototype.getHeight = function() { return this.rect.height; }

/**
 * Gets a rectangle describing the available client space within the layer.
 * @return A rectangle describing the client space within the layer.
 */
CanvasLayers.Layer.prototype.getClientRect = function() {
	return new CanvasLayers.Rectangle(0, 0, this.getWidth(), this.getHeight());
}

/**
 * Gets the layer's rectangle, clipped to the rectangles of its ancestor
 * layers.  This is useful if a layer has been moved partially or totally
 * out of the space available within its parent and only the visible portion
 * should be used (ie. in clipped drawing functions).
 * @return The layer's rectangle clipped to its ancestors.
 */
CanvasLayers.Layer.prototype.getRectClippedToHierarchy = function() {

	var rect = new CanvasLayers.Rectangle(this.getX(), this.getY(), this.getWidth(), this.getHeight());

	var parent = this.parent;
	var layer = this;

	while (parent) {

		// Copy parent's properties into the rect
		var parentRect = parent.rect;

		rect.clipToIntersect(parentRect);

		// Send up to parent
		layer = parent;
		parent = parent.parent;
	}
	
	return rect;
}

/**
 * Check if the layer is visible or not.  A layer is not visible if its parent
 * is not visible.
 * @return True if the layer and its parents are visible.
 */
CanvasLayers.Layer.prototype.isVisible = function() {
	if (!this.visible) return false;
	if (!this.parent) return this.visible;
	return (this.parent.isVisible());
}

/**
 * Gets the layer's canvas.  Recurses up the layer tree until the top-level
 * layer is found, which should return its reference to the current canvas.
 * @return The layer's canvas.
 */
CanvasLayers.Layer.prototype.getCanvas = function() {
	if (!this.canvas) {
		if (this.parent) {
			this.canvas = this.parent.getCanvas();
		}
	}
	return this.canvas;
}

/**
 * Gets the layer's damaged rectangle manager.  Recurses up the layer tree
 * until the top-level layer is found, which should return its reference to the
 * current damaged rectangle manager.
 * @return The layer's damaged rectangle manager.
 */
CanvasLayers.Layer.prototype.getDamagedRectManager = function() {
	if (this.parent) return this.parent.getDamagedRectManager();
	return null;
}

/**
 * Sends the visible portions of the layer as damaged to the damaged rectangle
 * manager for redraw.  Should be called whenever the visible state of the
 * layer should change.
 */
CanvasLayers.Layer.prototype.markRectsDamaged = function() {
	var damagedRects = this.getVisibleRects();
	
	var damagedRectManager = this.getDamagedRectManager();

	if (!damagedRectManager) return;
	
	for (var i in damagedRects) {
		damagedRectManager.addDamagedRect(damagedRects[i]);
	}
}

/**
 * Gets a list of the layer's visible rectangles.  These are the portions of
 * the layer not overlapped by other layers.  If the layer is totally
 * obscured an empty array is returned.
 * @return An array of all visible regions of the layer.
 */
CanvasLayers.Layer.prototype.getVisibleRects = function() {

	var rect = new CanvasLayers.Rectangle(this.getX(), this.getY(), this.getWidth(), this.getHeight());

	var visibleRects = new Array();
	visibleRects.push(rect);
	
	var layer = this;
	var parent = this.parent;

	while (parent && layer) {

		// Locate layer in the list; we add one to the index to
		// ensure that we deal with the next layer up in the z-order
		var layerIndex = parseInt(parent.children.getLayerIndex(layer)) + 1;

		// Layer should never be the bottom item on the screen
		if (layerIndex > 0) {

			// Remove any overlapped rectangles
			for (var i = layerIndex; i < parent.children.length(); i++) {
				for (var j = 0; j < visibleRects.length; ++j) {
					var remainingRects = new Array();
					
					var child = parent.children.at(i);
					var childRect = new CanvasLayers.Rectangle(child.getX(), child.getY(), child.getWidth(), child.getHeight());
					
					if (childRect.splitIntersection(visibleRects[j], remainingRects)) {
						visibleRects.splice(j, 1);
						j--;
						
						for (var k in remainingRects) {
							visibleRects.unshift(remainingRects[k]);
							j++;
						}
					}
				}
				
				// Stop processing if there are no more visible rects
				if (visibleRects.length == 0) break;
			}
		}

		if (visibleRects.length > 0) {
			layer = parent;

			if (parent) {
				parent = parent.parent;
			}
		} else {
			return visibleRects;
		}
	}
	
	return visibleRects;
}

/**
 * Closes the layer.
 */
CanvasLayers.Layer.prototype.close = function() {
	if (this.parent != null) {
		this.parent.children.remove(this);
	}
}

/**
 * Draws the region of the layer contained within the supplied rectangle.
 * @param rect The region to draw.
 */
CanvasLayers.Layer.prototype.render = function(rect) {
	if (!this.isVisible()) return;
	
	if (this.onRender != null) this.onRender(rect, this.getCanvas().getContext("2d"));
	
	// Enable this to draw rects around all clipping regions
	/*
	var ctx = this.getCanvas().getContext("2d");
	
	ctx.save();
	ctx.beginPath();
	ctx.rect(0, 0, 400, 400);
	ctx.clip();
	
	ctx.strokeStyle = '#f00';
	ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
	ctx.closePath();
	ctx.restore();
	*/
}

/**
 * Check if this layer collides with the supplied rectangle.
 * @param rect The rectangle to check for collisions.
 * @return True if a collision has occurred.
 */
CanvasLayers.Layer.prototype.checkRectCollision = function(rect) {
	if (!this.isVisible()) return false;

	var x = this.getX();
	var y = this.getY();
	
	if (rect.x + rect.width <= x) return false;
	if (rect.x >= x + this.rect.width) return false;
	if (rect.y + rect.height <= y) return false;
	if (rect.y >= y + this.rect.height) return false;
	
	return true;
}

/**
 * Check if the supplied co-ordinates fall within this layer.
 * @param x The x co-ordinate of the point.
 * @param y The y co-ordinate of the point.
 * @return True if the point falls within this layer.
 */
CanvasLayers.Layer.prototype.checkPointCollision = function(x, y) {
	if (!this.isVisible()) return false;

	var thisX = this.getX();
	var thisY = this.getY();
	
	if (x < thisX) return false;
	if (x >= thisX + this.rect.width) return false;
	if (y < thisY) return false;
	if (y >= thisY + this.rect.height) return false;
	
	return true;
}

/**
 * Gets the minimum x co-ordinate available to a child layer.
 * @return The minimum x co-ordinte available to a child layer.
 */
CanvasLayers.Layer.prototype.getMinChildX = function() {
	return 0;
}

/**
 * Gets the minimum y co-ordinate available to a child layer.
 * @return The minimum y co-ordinte available to a child layer.
 */
CanvasLayers.Layer.prototype.getMinChildY = function() {
	return 0;
}

/**
 * Gets the maximum x co-ordinate available to a child layer.
 * @return The maximum x co-ordinte available to a child layer.
 */
CanvasLayers.Layer.prototype.getMaxChildX = function() {
	return this.rect.width - 1;
}

/**
 * Gets the maximum y co-ordinate available to a child layer.
 * @return The maximum y co-ordinte available to a child layer.
 */
CanvasLayers.Layer.prototype.getMaxChildY = function() {
	return this.rect.height - 1;
}

/**
 * Moves the layer to the specified co-ordinates.
 * @param x The new x co-ordinate of the layer, relative to its parent.
 * @param y The new y co-ordinate of the layer, relative to its parent.
 */
CanvasLayers.Layer.prototype.moveTo = function(x, y) {

	this.hide();

	// Prevent moving outside parent
	if (this.parent != null) {
		var minX = this.parent.getMinChildX();
		var maxX = this.parent.getMaxChildX() - this.rect.width + 1;
		var minY = this.parent.getMinChildY();
		var maxY = this.parent.getMaxChildY() - this.rect.height + 1;
		
		if (x < minX) x = minX;
		if (x > maxX) x = maxX;
		if (y < minY) y = minY;
		if (y > maxY) y = maxY;
	}
	
	this.rect.x = x;
	this.rect.y = y;
		
	this.show();
}

/**
 * Hides the layer if it is visible.
 */
CanvasLayers.Layer.prototype.hide = function() {
	if (this.visible) {
		this.visible = false;

		this.markRectsDamaged();
	}
}

/**
 * Shows the layer if it is hidden.
 */
CanvasLayers.Layer.prototype.show = function() {
	if (!this.visible) {
		this.visible = true;
		
		this.markRectsDamaged();
	}
}

/**
 * Raises the layer to the top of its parent's stack.
 */
CanvasLayers.Layer.prototype.raiseToTop = function() {
	if (this.parent != null) {
		this.hide();
		this.parent.raiseChildToTop(this);
		this.show();
	}
}

/**
 * Raises the child to the top of the child stack.
 * @param child The child to raise to the top of the stack.
 */
CanvasLayers.Layer.prototype.raiseChildToTop = function(child) {
	this.children.raiseToTop(child);
}

/**
 * Lowers the layer to the bottom of its parent's stack.
 */
CanvasLayers.Layer.prototype.lowerToBottom = function() {
	if (this.parent != null) {
		this.hide();
		this.parent.lowerChildToBottom(this);
		this.show();
	}
}

/**
 * Lowers the child to the bottom of the child stack.
 * @param child The child to lower to the bottom of the stack.
 */
CanvasLayers.Layer.prototype.lowerChildToBottom = function(child) {
	this.children.lowerToBottom(child);
}


/** Container Methods **/

CanvasLayers.Container.prototype = new CanvasLayers.Layer;

CanvasLayers.Container.prototype.constructor = CanvasLayers.Container;

/**
 * Gets the damaged rectangle manager.
 * @return The damaged rectangle manager.
 */
CanvasLayers.Container.prototype.getDamagedRectManager = function() {
	return this.damagedRectManager;
}

/**
 * Redraws the system.
 */
CanvasLayers.Container.prototype.redraw = function() {
	this.damagedRectManager.redraw();
}