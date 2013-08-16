/**
 * ProcessWire Map Markup (JS)
 *
 * Renders maps for the FieldtypeMapMarker module
 * 
 * ProcessWire 2.x 
 * Copyright (C) 2013 by Ryan Cramer 
 * Licensed under GNU/GPL v2, see LICENSE.TXT
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
	this.options = {
		zoom: 10, 
		center: null, 
		mapTypeId: google.maps.MapTypeId.ROADMAP, 
		scrollwheel: false, 
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.DROPDOWN_MENU	
		}, 
		scaleControl: false
	};

	this.init = function(mapID, lat, lng) {
		if(lat != 0) this.options.center = new google.maps.LatLng(lat, lng); 
		this.map = new google.maps.Map(document.getElementById(mapID), this.options); 
	}

	this.setOption = function(key, value) {
		this.options[key] = value; 
	}

	this.addMarker = function(lat, lng, url, title, icon) {

		var latLng = new google.maps.LatLng(lat, lng); 
		var marker = new google.maps.Marker({ 
			position: latLng, 
			map: this.map,
			linkURL: ''
		});

		if(url.length > 0) marker.linkURL = url;
		if(icon.length > 0) marker.icon = icon;
		marker.setTitle(title); 

		this.markers[this.numMarkers] = marker;
		this.numMarkers++;

		if(marker.linkURL.length > 0) {
			google.maps.event.addListener(marker, 'click', function(e) {
				window.location.href = marker.linkURL; 
			}); 
		}
	}

	this.fitToMarkers = function() {

		var bounds = new google.maps.LatLngBounds();

		for(var i = 0; i < this.numMarkers; i++) {	
			var latLng = this.markers[i].position; 
			bounds.extend(latLng); 
		}

		this.map.fitBounds(bounds);

		var listener = google.maps.event.addListener(this.map, "idle", function() { 
			if(this.map.getZoom() < 2) this.map.setZoom(2); 
			google.maps.event.removeListener(listener); 
		});
	}
}

