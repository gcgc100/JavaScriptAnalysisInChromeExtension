if(!(typeof ko === 'undefined' || ko === null)) {
	ko.bindingHandlers.stopBinding = {
	    init: function() {
	        return { controlsDescendantBindings: true };
	    }
	};

	ko.virtualElements.allowedBindings.stopBinding = true;
}