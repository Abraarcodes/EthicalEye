// Function to check if all children of an element should be ignored
var allIgnoreChildren = function(element) {
    // If the element has no children, it should not be ignored
    if (element.children.length === 0) {
        return false;
    } else {
        // Loop through each child of the element
        for (var child of element.children) {
            // If the child is in the ignoredElements list, continue to the next child
            if (ignoredElements.includes(child.tagName.toLowerCase())) {
                continue;
            } else {
                // If any child is not in the ignoredElements list, return false
                return false;
            }
        }
        // If all children are in the ignoredElements list, return true
        return true;
    }
};

// Recursive function to segment elements of a webpage
var segments = function(element) {
    // Base case: if the element is null, return an empty array
    if (!element) {
        return [];
    }

    // Get the tag name of the element in lowercase
    var tag = element.tagName.toLowerCase();

    // Check if the element should be processed
    if (!ignoredElements.includes(tag) && !isPixel(element) && isShown(element)) {
        // If the element is a block element
        if (blockElements.includes(tag)) {
            // If the element doesn't contain any block elements
            if (!containsBlockElements(element)) {
                // If all children of the element should be ignored, return an empty array
                if (allIgnoreChildren(element)) {
                    return [];
                } else {
                    // If the element's area is larger than 30% of the window area, segment its children
                    if (getElementArea(element) / winArea > 0.3) {
                        var result = [];

                        // Recursively segment each child and add it to the result array
                        for (var child of element.children) {
                            result = result.concat(segments(child));
                        }

                        // Return the result array
                        return result;
                    } else {
                        // If the element's area is smaller than 30% of the window area, return the element itself
                        return [element];
                    }
                }
            } else if (containsTextNodes(element)) {
                // If the element contains text nodes, return the element itself
                return [element];
            } else {
                // If the element contains other block elements, segment its children
                var result = [];

                // Recursively segment each child and add it to the result array
                for (var child of element.children) {
                    result = result.concat(segments(child));
                }

                // Return the result array
                return result;
            }
        } else {
            // If the element is not a block element
            if (containsBlockElements(element, false)) {
                // If the element contains block elements, segment its children
                var result = [];

                // Recursively segment each child and add it to the result array
                for (var child of element.children) {
                    result = result.concat(segments(child));
                }

                // Return the result array
                return result;
            } else {
                // If the element's area is larger than 30% of the window area, segment its children
                if (getElementArea(element) / winArea > 0.3) {
                    var result = [];

                    // Recursively segment each child and add it to the result array
                    for (var child of element.children) {
                        result = result.concat(segments(child));
                    }

                    // Return the result array
                    return result;
                } else {
                    // If the element's area is smaller than 30% of the window area, return the element itself
                    return [element];
                }
            }
        }
    } else {
        // If the element is in the ignoredElements list, is a pixel, or is not shown, return an empty array
        return [];
    }
};
