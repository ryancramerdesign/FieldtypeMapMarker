/**
 * Display a Google Map and pinpoint a location for InputfieldMapMarker
 *
 */

var InputfieldMapMarker = {

	options: {
		zoom: 12, 
		draggable: true,
		center: null,
		mapTypeId: google.maps.MapTypeId.HYBRID,
		scrollwheel: false,	
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
		},
		scaleControl: false,
		
	},	

	init: function(mapId, lat, lng) {
		var options = InputfieldMapMarker.options; 
		options.center = new google.maps.LatLng(lat, lng); 	
		options.zoom = 12; 
		var map = new google.maps.Map(document.getElementById(mapId), options); 	
		var marker = new google.maps.Marker({
			position: options.center, 
			map: map,
			draggable: options.draggable
		}); 

 		document.getElementById("_Inputfield_karta_lat").value = marker.getPosition().lat();
        document.getElementById("_Inputfield_karta_lng").value = marker.getPosition().lng();

        google.maps.event.addListener(marker, 'dragend', function (event) {
            document.getElementById("_Inputfield_karta_lat").value = this.getPosition().lat();
            document.getElementById("_Inputfield_karta_lng").value = this.getPosition().lng();
        });
		
	}
};



$(document).ready(function() {
	$(".InputfieldMapMarkerMap").each(function() {
		var $t = $(this);
		InputfieldMapMarker.init($t.attr('id'), $t.attr('data-lat'), $t.attr('data-lng')); 
	}); 
}); 

