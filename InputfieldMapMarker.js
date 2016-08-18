/**
 * Display a Google Map and pinpoint a location for InputfieldMapMarker
 *
 */

var InputfieldMapMarker = {

	options: {
		zoom: 12, // mats, previously 5
		draggable: true, // +mats
		center: null,
		//key: config.InputfieldMapMarker.googleApiKey, 
		mapTypeId: google.maps.MapTypeId.HYBRID,
		scrollwheel: false,	
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
		},
		scaleControl: false
	},	

	init: function(mapId, lat, lng, zoom, mapType) {

		var options = InputfieldMapMarker.options; 

		if(zoom < 1) zoom = 12; 
		options.center = new google.maps.LatLng(lat, lng); 	
		options.zoom = parseInt(zoom); 

		if(mapType == 'SATELLITE') options.mapTypeId = google.maps.MapTypeId.SATELLITE; 
			else if(mapType == 'ROADMAP') options.mapTypeId = google.maps.MapTypeId.ROADMAP; 

		var map = new google.maps.Map(document.getElementById(mapId), options); 	

		var marker = new google.maps.Marker({
			position: options.center, 
			map: map,
			draggable: options.draggable	
		}); 

		var $map = $('#' + mapId); 
		var $lat = $map.siblings(".InputfieldMapMarkerLat").find("input[type=text]");
		var $lng = $map.siblings(".InputfieldMapMarkerLng").find("input[type=text]");
		var $addr = $map.siblings(".InputfieldMapMarkerAddress").find("input[type=text]"); 
		var $addrJS = $map.siblings(".InputfieldMapMarkerAddress").find("input[type=hidden]"); 
		var $toggle = $map.siblings(".InputfieldMapMarkerToggle").find("input[type=checkbox]");
		var $zoom = $map.siblings(".InputfieldMapMarkerZoom").find("input[type=number]");
		var $notes = $map.siblings(".notes");

		$lat.val(marker.getPosition().lat());
		$lng.val(marker.getPosition().lng());
		$zoom.val(map.getZoom()); 

		google.maps.event.addListener(marker, 'dragend', function(event) {
			var geocoder = new google.maps.Geocoder();
			var position = this.getPosition();
			$lat.val(position.lat());
			$lng.val(position.lng());
			if($toggle.is(":checked")) {
				geocoder.geocode({ 'latLng': position }, function(results, status) {
					if(status == google.maps.GeocoderStatus.OK && results[0]) {
						$addr.val(results[0].formatted_address);	
						$addrJS.val($addr.val()); 
					}
					$notes.text(status);
				});
			}
		});

		google.maps.event.addListener(map, 'zoom_changed', function() {
			$zoom.val(map.getZoom()); 
		}); 

		$addr.blur(function() {
			if(!$toggle.is(":checked")) return true;
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode({ 'address': $(this).val()}, function(results, status) {
				if(status == google.maps.GeocoderStatus.OK && results[0]) {
					var position = results[0].geometry.location;
					map.setCenter(position);
					marker.setPosition(position);
					$lat.val(position.lat());
					$lng.val(position.lng());
					$addrJS.val($addr.val()); 
				}
				$notes.text(status); 
			});
			return true;	
		}); 

		$zoom.change(function() {
			map.setZoom(parseInt($(this).val())); 
		}); 

		$toggle.click(function() {
			if($(this).is(":checked")) {
				$notes.text('Geocode ON');
				// google.maps.event.trigger(marker, 'dragend'); 
				$addr.trigger('blur');
			} else {
				$notes.text('Geocode OFF');
			}
			return true;
		});

		// added by diogo to solve the problem of maps not rendering correctly in hidden elements
		// trigger a resize on the map when either the tab button or the toggle field bar are pressed

		// get the tab element where this map is integrated
		var $map = $('#' + mapId); 
		var $tab = $('#_' + $map.closest('.InputfieldFieldsetTabOpen').attr('id'));
		// get the inputfield where this map is integrated and add the tab to the stack
		var $inputFields = $map.closest('.Inputfield').find('.InputfieldStateToggle').add($tab);

		$inputFields.on('click',function(){
			// give it time to open
			window.setTimeout(function(){
				google.maps.event.trigger(map,'resize');
				map.setCenter(options.center); 
			}, 200);
		});
		
	}
};

$(document).ready(function() {
	$(".InputfieldMapMarkerMap").each(function() {
		var $t = $(this);
		InputfieldMapMarker.init($t.attr('id'), $t.attr('data-lat'), $t.attr('data-lng'), $t.attr('data-zoom'), $t.attr('data-type')); 
	}); 
}); 
