/**
 * ProcessWire Map Markup (JS)
 *
 * Renders maps for the FieldtypeMapMarker module
 * 
 * ProcessWire 2.x 
 * Copyright (C) 2016 by Ryan Cramer 
 * Licensed under MPL 2.0
 * 
 * http://processwire.com
 *
 * Javascript Usage:
 * =================
 * var map = new MarkupGoogleMap();
 * map.setOption('any-google-maps-option', 'value'); 
 * map.setOption('zoom', 12); // example
 * 
 * // init(container ID, latitude, longitude):
 * map.init('#map-div', 26.0936823, -77.5332796); 
 * 
 * // addMarker(latitude, longitude, optional URL, optional URL to icon file):
 * map.addMarker(26.0936823, -77.5332796, 'en.wikipedia.org/wiki/Castaway_Cay', ''); 
 * map.addMarker(...you may have as many of these as you want...); 
 * 
 * // optionally fit the map to the bounds of the markers you added
 * map.fitToMarkers();
 *
 */

function MarkupGoogleMap() {

	this.map = null;
	this.markers = [];
	this.numMarkers = 0;
	this.icon = '';
	this.iconHover = '';
	this.shadow = '';

	this.hoverBox = null;
	this.hoverBoxOffsetTop = 0;
	this.hoverBoxOffsetLeft = 0;

	this.options = {
		zoom: 10, 
		center: null, 
		mapTypeId: google.maps.MapTypeId.ROADMAP, 
		scrollwheel: false, 
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.DROPDOWN_MENU	
		}, 
		scaleControl: false,

		// disable points of interest
		styles: [{
			featureType: "poi", 
			stylers: [ { visibility: "off" } ]
		}]
	};


	this._currentURL = '';

	this.init = function(mapID, lat, lng) {
		if(lat != 0) this.options.center = new google.maps.LatLng(lat, lng); 
		this.map = new google.maps.Map(document.getElementById(mapID), this.options); 
	}

	this.setOption = function(key, value) {
		this.options[key] = value; 
	}

	this.setIcon = function(url) {
		this.icon = url;
	}
	
	this.setIconHover = function(url) {
		this.iconHover = url;
	}

	this.setShadow = function(url) {
		this.shadow = url;
	}

	this.setHoverBox = function(markup) {

		if(!markup.length) {
			this.hoverBox = null;
			return;
		}

		this.hoverBox = $(markup);
		var $hoverBox = this.hoverBox;

		this.hoverBoxOffsetTop = parseInt($hoverBox.attr('data-top')); 
		this.hoverBoxOffsetLeft = parseInt($hoverBox.attr('data-left')); 

		$("body").append($hoverBox);

		// keep it hidden/out of the way until needed
		$hoverBox.css({
			position: 'absolute',
			left: 0,
			top: '-100px'
		});

		$hoverBox.mouseout(function() {
			$hoverBox.hide();
		}).click(function() {
			if(this._currentURL.length > 0) window.location.href = this._currentURL;
		});
	}

	this.addMarker = function(lat, lng, url, title, icon, shadow) {
		if(lat == 0.0) return;

		var latLng = new google.maps.LatLng(lat, lng); 
		var zIndex = 99999 + this.numMarkers;

		var markerOptions = {
			position: latLng, 
			map: this.map,
			linkURL: '',
			zIndex: zIndex
		}; 

		if(typeof icon !== "undefined" && icon.length > 0) markerOptions.icon = icon;
			else if(this.icon) markerOptions.icon = this.icon;
		
		// console.log(markerOptions); 
		
		if(typeof shadow !== "undefined" && shadow.length > 0) markerOptions.shadow = shadow; 
			else if(this.shadow.length > 0) markerOptions.shadow = this.shadow; 

		var marker = new google.maps.Marker(markerOptions); 

		if(url.length > 0) marker.linkURL = url;
		if(this.hoverBox) marker.hoverBoxTitle = title; 
			else marker.setTitle(title); 

		this.markers[this.numMarkers] = marker;
		this.numMarkers++;

		if(marker.linkURL.length > 0) {
			google.maps.event.addListener(marker, 'click', function(e) {
				window.location.href = marker.linkURL; 
			}); 
		}
		
		if(markerOptions.icon !== "undefined" && this.iconHover) {
			var iconHover = this.iconHover; 
			google.maps.event.addListener(marker, 'mouseover', function(e) {
				marker.setIcon(iconHover); 
			});
			google.maps.event.addListener(marker, 'mouseout', function(e) {
				marker.setIcon(markerOptions.icon); 
			}); 
		}

		if(this.hoverBox) {

			var $hoverBox = this.hoverBox; 
			var offsetTop = this.hoverBoxOffsetTop;
			var offsetLeft = this.hoverBoxOffsetLeft; 

			var mouseMove = function(e) {
				$hoverBox.css({
					'top': e.pageY + offsetTop,
					'left': e.pageX + offsetLeft
					});
			}; 

			// console.log($hoverBox); 

			google.maps.event.addListener(marker, 'mouseover', function(e) {
				this._currentURL = url;
				$hoverBox.html("<span>" + marker.hoverBoxTitle + "</span>")
					.css('top', '0px')
					.css('left', '0px')
					.css('display', 'block')
					.css('width', 'auto')
					.css('z-index', 9999); 
				$hoverBox.show();

				$(document).mousemove(mouseMove); 
			}); 

			google.maps.event.addListener(marker, 'mouseout', function(e) {
				$hoverBox.hide();
				$(document).unbind("mousemove", mouseMove);
			}); 

		}
	}

	this.fitToMarkers = function() {

		var bounds = new google.maps.LatLngBounds();
		var map = this.map;

		for(var i = 0; i < this.numMarkers; i++) {	
			var latLng = this.markers[i].position; 
			bounds.extend(latLng); 
		}

		map.fitBounds(bounds);


		var listener = google.maps.event.addListener(map, "idle", function() { 
			if(map.getZoom() < 2) map.setZoom(2); 
			google.maps.event.removeListener(listener); 
		});
	}
}

