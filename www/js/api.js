    var directionsDisplay;
    var directionsService
	var map;
	var mapgastations;
	var fuel_type = 'gasoline';
	var fuel_name = 'Бензин А95';
	var avg_price = '0,00';
	var diff_formatted = '+0,00';
	
	var id;
	
	var mylat;
	var mylon;
	var destlat;
	var destlon;

    // onSuccess Geolocation
    //
    function onSuccess(position) {
    	mylat = position.coords.latitude;
    	mylon = position.coords.longitude;
    	window.localStorage.setItem("mylat", mylat);
    	window.localStorage.setItem("mylon", mylon);
		nearest_gasstation(position.coords.latitude,position.coords.longitude);
    }

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('Не може да открием Вашето местоположение\n' + 'Моля проверете настройките на телефона Ви\n' + error.message + '\n');
        // Sofia
        mylat = 42.6985;
		mylon = 23.3212;
		window.localStorage.setItem("mylat", mylat);
    	window.localStorage.setItem("mylon", mylon);
		nearest_gasstation(mylat,mylon);
    }

    function refresh_info()
    {
    	$('#refresh').empty().append('<a href="#"><i  class="icon-refresh icon-spin icon-large"></i></a>');

    	fuel_type = window.localStorage.getItem("fuel_type");
    	fuel_name = window.localStorage.getItem("fuel_name");
    	
    	if (fuel_type == null) {
			fuel_type = 'gasoline';
			fuel_name = 'Бензин А95';
			window.localStorage.setItem("fuel_type", "gasoline");
			window.localStorage.setItem("fuel_name", "Бензин А95");
		}

    	avg_price = window.localStorage.getItem("avg_price");
    	$('#avg_price').empty().append(avg_price);
    	
    	$('#fuel').empty().append(fuel_name);
    	diff_formatted = window.localStorage.getItem("diff_formatted");
    	$('#diff').empty().append(diff_formatted);
    	
    	$('#avg_price').empty().append(avg_price);
    	$('#fuel').empty().append(fuel_name);
    	$('#diff').empty().append(diff_formatted);
 
    	get_avg_price();
    	get_diff_price();
    	navigator.geolocation.getCurrentPosition(onSuccess, onError, { maximumAge: 30000, timeout: 15000, enableHighAccuracy: true });
    }
    
    function refresh_gasstations()
    {
    	$('#refreshgasstations').empty().append('<a href="#"><i  class="icon-refresh icon-spin icon-large"></i></a>');
    	get_gasstattions();
    	$('#gasstations_list').listview();
    	
    }
    
    function refresh_bigmap()
    {
    	$('#refresh_bigmap').empty().append('<a href="#"><i  class="icon-refresh icon-spin icon-large"></i></a>');
    	//$('#googleBigMap').height($(window).height() - (10 + $('#topnav').height() - $('#bottomnav').height()));
    	var mapProp = {
		  center:new google.maps.LatLng(mylat,mylon),
		  zoom:12,
		  mapTypeId:google.maps.MapTypeId.ROADMAP
		};
		  
		var bigmap = new google.maps.Map(document.getElementById("googleBigMap"),mapProp);
		
				
	  	var visitor=new google.maps.Marker({
		  position:new google.maps.LatLng(mylat,mylon),
		  map: bigmap,
		  title: "Вие се намирате тук"
		  });
		var request = $.ajax({
			  url: "http://fuelo.net/api/get_near_gasstations",
			  type: "POST",
			  data: {lat:mylat,lon:mylon,fuel:fuel_type},
			  dataType: "json",
			  timeout: 15000
			});
			 
		request.done(function(data) {
			var infowindow = new google.maps.InfoWindow({});
			var shadow = new google.maps.MarkerImage('img/shadow_price.png',
				 new google.maps.Size(40, 56),
				 null,
				 new google.maps.Point(20, 55)
			);
			obj = jQuery.parseJSON(data.stations);
			for (var i = 0; i < obj.length; i++) {
				var a = obj[i];

				var image = {
					  url: 'http://fuelo.net/img/logos/'+a.logo+'-small.png',
					  size: new google.maps.Size(30, 25),
					  origin: new google.maps.Point(0, 0),
					  anchor: new google.maps.Point(15, 36)
				};
				
				var marker = new MarkerWithLabel({
					   position: new google.maps.LatLng(a.lat,a.lon),
					   map: bigmap,
					   icon: image,
				 	   shadow: shadow,
					   labelContent: a.price + 'лв',
					   html: '<a href="#gasstation" onclick="setid('+a.id+');">' + a.brand + ' ' + a.name + '</a>',
					   labelAnchor: new google.maps.Point(20, 55),
					   labelClass: "labels", // the CSS class for the label
					   labelStyle: {}
				});

				google.maps.event.addListener(marker, 'click', function() {
						infowindow.setContent(this.html);
						infowindow.open(bigmap,this);
				});
			}
			$('#refresh_bigmap').empty().append('<a href="#"><i class="icon-refresh icon-large"></i></a>');
		});
		 
		request.fail(function(jqXHR, textStatus) {
		  alert( "Няма връзка със сървъра. Моля опитайте по-късно.");
		  $('#refresh_bigmap').empty().append('<a href="#"><i class="icon-refresh icon-large"></i></a>');
		});
	
    }

    function refresh_prices()
    {
    	$('#refresh_prices').empty().append('<a href="#"><i  class="icon-refresh icon-spin icon-large"></i></a>');
    	
    	// get avg prices from local store
    	$('#gasolineprice').empty().append(window.localStorage.getItem("avg_price_gasoline"));
    	$('#dieselprice').empty().append(window.localStorage.getItem("avg_price_diesel"));
    	$('#lpgprice').empty().append(window.localStorage.getItem("avg_price_lpg"));
    	$('#methaneprice').empty().append(window.localStorage.getItem("avg_price_methane"));
    	
    	// Real refresh
    	get_avg_price_gasoline();
    	get_avg_price_diesel();
    	get_avg_price_lpg();
    	get_avg_price_methane();
    	
    	get_prices_gasoline();
    	get_prices_diesel();
    	get_prices_lpg();
    	get_prices_methane();
    }

	function refresh_settings()
    {
        // Fuelselect 
        $("#fuelselect").val(fuel_type);
        $('#fuelselect').selectmenu('refresh');

		$('#fuelselect').on('change', function() {
		  	fuel_type = this.value;
		   	fuel_name = $("#fuelselect option:selected").text();;
			window.localStorage.setItem("fuel_type", fuel_type);
			window.localStorage.setItem("fuel_name", fuel_name);

			$.mobile.changePage('#saved', 'pop');
		});
    }

	function nearest_gasstation(latitude,longitude)
	{
		var request = $.ajax({
		  url: "http://fuelo.net/api/get_recommended_gasstation",
		  type: "POST",
		  data: {lat:latitude,lon:longitude,fuel:fuel_type},
		  dataType: "json",
		  timeout: 15000
		});
		 
		request.done(function(data) {
		  	//var obj = jQuery.parseJSON(data);
			$('#nearest_gasstation').empty().append(data.text);
			destlat = data.lat;
			destlon = data.lon;
			initialize(data.lat,data.lon,data.brand);
		});
		 
		request.fail(function(jqXHR, textStatus) {
		  alert( "Няма връзка със сървъра. Моля опитайте по-късно.");
		});
	}

	function initialize(latitude,longitude,brand)
	{
		directionsService = new google.maps.DirectionsService();
		directionsDisplay = new google.maps.DirectionsRenderer();
		var mapProp = {
		  center:new google.maps.LatLng(latitude,longitude),
		  zoom:15,
		  mapTypeId:google.maps.MapTypeId.ROADMAP
		  };
		map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
		directionsDisplay.setMap(map);
		directionsDisplay.setPanel(document.getElementById("directionsPanel"));

		var marker=new google.maps.Marker({
		  position:new google.maps.LatLng(latitude,longitude),
		  icon:'http://fuelo.net/img/logos/'+brand+'-small.png',
		  map: map,
		  title: "Gasstation"
		  });
		  
	  	var visitor=new google.maps.Marker({
		  position:new google.maps.LatLng(mylat,mylon),
		  map: map,
		  title: "Вие се намирате тук"
		  });
		  
		  $('#refresh').empty().append('<a href="#"><i  class="icon-refresh icon-large"></i></a>');
	}

	function calcRoute() {
	  var start = new google.maps.LatLng(mylat,mylon);
	  var end = new google.maps.LatLng(destlat,destlon);
	  var request = {
		origin:start,
		destination:end,
		travelMode: google.maps.TravelMode.DRIVING
	  };
	  directionsService.route(request, function(result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			$('#directionsPanel').empty()
		  	directionsDisplay.setDirections(result);
		} else { alert ('Error getting directions: ' + status); } 
	  });
	}

// Get avg price by fuel type
	function get_avg_price()
	{
		var request = $.ajax({
		  url: "http://fuelo.net/api/get_avg_price",
		  type: "POST",
		  data: {fuel:fuel_type},
		  dataType: "json",
		  timeout: 15000
		});
		 
		request.done(function(obj) {
			$('#avg_price').empty().append(obj.avg_price);
			window.localStorage.setItem("avg_price", obj.avg_price);
		});
		 
		request.fail(function(jqXHR, textStatus) {
		  alert( "Няма връзка със сървъра. Моля опитайте по-късно.");
		});
	}
	
	function get_diff_price()
	{
		// Get near gasstations by ajax
		$.ajax({
			url: 'http://fuelo.net/api/get_diff_price',
			type:'POST',
			dataType: 'text',
			data: { fuel:fuel_type },
			success: function(data){
				var obj = jQuery.parseJSON(data);
					$('#diff').empty().append(obj.diff_formatted);
					window.localStorage.setItem("diff_formatted", obj.diff_formatted);
					window.localStorage.setItem("diff", obj.diff);
				} // End of success function of ajax form
			}); // End of ajax call 
	}

	function get_avg_price_gasoline()
	{
		// Get near gasstations by ajax
		$.ajax({
			url: 'http://fuelo.net/api/get_avg_price',
			type:'POST',
			dataType: 'text',
			data: { fuel:'gasoline' },
			success: function(data){
				var obj = jQuery.parseJSON(data);
					$('#gasolineprice').empty().append(obj.avg_price);
					window.localStorage.setItem("avg_price_gasoline", obj.avg_price);
				} // End of success function of ajax form
			}); // End of ajax call 
	}
	
	function get_avg_price_diesel()
	{
		// Get near gasstations by ajax
		$.ajax({
			url: 'http://fuelo.net/api/get_avg_price',
			type:'POST',
			dataType: 'text',
			data: { fuel:'diesel' },
			success: function(data){
				var obj = jQuery.parseJSON(data);
					$('#dieselprice').empty().append(obj.avg_price);
					window.localStorage.setItem("avg_price_diesel", obj.avg_price);
				} // End of success function of ajax form
			}); // End of ajax call 
	}

	function get_avg_price_lpg()
	{
		// Get near gasstations by ajax
		$.ajax({
			url: 'http://fuelo.net/api/get_avg_price',
			type:'POST',
			dataType: 'text',
			data: { fuel:'lpg' },
			success: function(data){
				var obj = jQuery.parseJSON(data);
					$('#lpgprice').empty().append(obj.avg_price);
					window.localStorage.setItem("avg_price_lpg", obj.avg_price);
				} // End of success function of ajax form
			}); // End of ajax call 
	}

	function get_avg_price_methane()
	{
		// Get near gasstations by ajax
		$.ajax({
			url: 'http://fuelo.net/api/get_avg_price',
			type:'POST',
			dataType: 'text',
			data: { fuel:'methane' },
			success: function(data){
				var obj = jQuery.parseJSON(data);
					$('#methaneprice').empty().append(obj.avg_price);
					window.localStorage.setItem("avg_price_methane", obj.avg_price);
				} // End of success function of ajax form
			}); // End of ajax call 
	}

	function get_gasstattions()
	{
		initialize_gasstations_map();
		// Get near gasstations by ajax
		var request = $.ajax({
		  url: "http://fuelo.net/api/get_recommended_gasstations",
		  type: "POST",
		  data: {lat:mylat,lon:mylon,fuel:fuel_type},
		  dataType: "json",
		  timeout: 15000
		});
		 
		request.done(function(obj) {
			$('#gasstations_list').empty().append(obj.list);
			$('#gasstations_list').listview('refresh');
			$('#refreshgasstations').empty().append('<a href="#"><i  class="icon-refresh icon-large"></i></a>');
			ob = jQuery.parseJSON(obj.coords);
			for (var i = 0; i < ob.length; i++) {
				var a = ob[i];
				addMarker(a.lat,a.lon,a.logo) 
			}
		});
		 
		request.fail(function(jqXHR, textStatus) {
		  alert( "Няма връзка със сървъра. Моля опитайте по-късно.");
		});
	}
	
	function get_prices_gasoline()
	{
		// Get near gasstations by ajax
		$.ajax({
			url: 'http://fuelo.net/api/get_prices',
			type:'POST',
			dataType: 'text',
			data: { fuel_type:'gasoline' },
			success: function(data){
				var obj = jQuery.parseJSON(data);
					$('#gasoline_prices').empty().append(obj.list);
					if (fuel_type == 'gasoline')
					{
						$('#gasoline').trigger('expand');
					}
					//$('#prices_list').collapsible-set('refresh');
				} // End of success function of ajax form
			}); // End of ajax call 
	}

	function get_prices_diesel()
	{
		// Get near gasstations by ajax
		$.ajax({
			url: 'http://fuelo.net/api/get_prices',
			type:'POST',
			dataType: 'text',
			data: { fuel_type:'diesel' },
			success: function(data){
				var obj = jQuery.parseJSON(data);
					$('#diesel_prices').empty().append(obj.list);
					if (fuel_type == 'diesel')
					{
						$('#diesel').trigger('expand');
					}
					//$('#prices_list').collapsible-set('refresh');
				} // End of success function of ajax form
			}); // End of ajax call 
	}

	function get_prices_lpg()
	{
		// Get near gasstations by ajax
		$.ajax({
			url: 'http://fuelo.net/api/get_prices',
			type:'POST',
			dataType: 'text',
			data: { fuel_type:'lpg' },
			success: function(data){
				var obj = jQuery.parseJSON(data);
					$('#lpg_prices').empty().append(obj.list);
					if (fuel_type == 'lpg')
					{
						$('#lpg').trigger('expand');
					}
					//$('#prices_list').collapsible-set('refresh');
				} // End of success function of ajax form
			}); // End of ajax call 
	}

	function get_prices_methane()
	{
		// Get near gasstations by ajax
		$.ajax({
			url: 'http://fuelo.net/api/get_prices',
			type:'POST',
			dataType: 'text',
			data: { fuel_type:'methane' },
			success: function(data){
				var obj = jQuery.parseJSON(data);
					$('#methane_prices').empty().append(obj.list);
					if (fuel_type == 'methane')
					{
						$('#methane').trigger('expand');
					}
					//$('#prices_list').collapsible-set('refresh');
					$('#refresh_prices').empty().append('<a href="#"><i  class="icon-refresh icon-large"></i></a>');
				} // End of success function of ajax form
			}); // End of ajax call 
	}

	function setid(i)
	{
		id = i;
	}

    function refresh_gasstation()
    {
    	//var id = $(document).getUrlParam("id");
    	$('#refresh_gasstation').empty().append('<a href="#"><i  class="icon-refresh icon-spin icon-large"></i></a>');
    	$.ajax({
			url: 'http://fuelo.net/api/get_gasstation',
			type:'POST',
			dataType: 'text',
			data: { id:id },
			success: function(data){
				var obj = jQuery.parseJSON(data);
					$('#brand_name').empty().append(obj.brand_name);
					$('#gasstation_name').empty().append(obj.gasstation_name);
					$('#logo').empty().append('<img src="http://fuelo.net/img/logos/' + obj.logo + '-small.png" /\>');
					$('#city').empty().append(obj.city);
					$('#address').empty().append(obj.address);
					$('#services').empty().append(obj.services);
					$('#payments').empty().append(obj.payments);
					$('#phone').empty().append(obj.phone);
					$('#worktime').empty().append(obj.worktime);
					
					$('#gasstation_location').empty().append('<a href="geo:'+obj.lat+','+obj.lon+'" data-role="button" data-mini="true"><i class="icon-map-marker"></i> Google Maps</a>');
					$('#gasstation_phone').empty().append('<a href="tel:'+obj.phone+'" data-role="button" data-mini="true"><i class="icon-phone"></i> Обаждане</a>');
					$("#buttons_grid").trigger("create");
					
					initialize_gasstation_map(obj.lat,obj.lon,obj.logo);
					
				} // End of success function of ajax form
			}); // End of ajax call 
	  
    }

	function initialize_gasstation_map(latitude,longitude,brand)
	{
		var mapProp = {
		  center:new google.maps.LatLng(latitude,longitude),
		  zoom:15,
		  mapTypeId:google.maps.MapTypeId.ROADMAP
		  };
		var mapgastation =new google.maps.Map(document.getElementById("googleMapGasstation"),mapProp);

		var marker=new google.maps.Marker({
		  position:new google.maps.LatLng(latitude,longitude),
		  icon:'http://fuelo.net/img/logos/'+brand+'-small.png',
		  map: mapgastation,
		  title: "Gasstation"
		  });
		  
	  	var visitor=new google.maps.Marker({
		  position:new google.maps.LatLng(mylat,mylon),
		  map: mapgastation,
		  title: "Вие се намирате тук"
		  });
		  
		  $('#refresh_gasstation').empty().append('<a href="#"><i class="icon-refresh icon-large"></i></a>');
	}

// Function for adding a marker to the page.
    function addMarker(lat,lon,logo)
    {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lon),
            icon:'http://fuelo.net/img/logos/'+logo+'-small.png',
            map: mapgasstations
        });
    }

function initialize_gasstations_map()
{
	var mapProp = {
	  center:new google.maps.LatLng(mylat,mylon),
	  zoom:12,
	  mapTypeId:google.maps.MapTypeId.ROADMAP
	  };
	  
	mapgasstations = new google.maps.Map(document.getElementById("googleMapGasstations"),mapProp);
	  
  	var visitor=new google.maps.Marker({
	  position:new google.maps.LatLng(mylat,mylon),
	  map: mapgasstations,
	  title: "Вие се намирате тук"
	  });
	  
	  $('#refresh_gasstations').empty().append('<a href="#"><i class="icon-refresh icon-large"></i></a>');
}

