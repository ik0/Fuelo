    var directionsDisplay;
    var directionsService
	var map;
	var mapgastations;
	var fuel_type = 'gasoline';
	var fuel_name = 'Бензин А95';
	var avg_price = '0,00';
	var diff_formatted = '+0,00';
	var favbrands = new Array();
	
	var id;
	
	var mylat;
	var mylon;
	var destlat;
	var destlon;
	
	var pushNotification;
	var gcm_id;
	
	var apikey = '69d4801f4b490c1';

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

    	
    	
    	if (fuel_type == null) {
			fuel_type = 'gasoline';
			fuel_name = 'Бензин А95';
			window.localStorage.setItem("fuel_type", "gasoline");
			window.localStorage.setItem("fuel_name", "Бензин А95");
		}
		
		if (favbrands == null) {
		    favbrands = [];
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

			obj = jQuery.parseJSON(data.stations);
			for (var i = 0; i < obj.length; i++) {
				var a = obj[i];

				var image = {
					  url: 'http://fuelo.net/img/logos/'+a.logo+'-shadow.png',
					  size: new google.maps.Size(34, 40),
	                  origin: new google.maps.Point(0, 0),
	                  anchor: new google.maps.Point(17, 38)
				};
				
				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(a.lat,a.lon),
					map: bigmap,
					icon: image,
					html: '<a href="#gasstation" onclick="setid('+a.id+');">' + a.brand + ' ' + a.name + '</a><br /><img src="http://fuelo.net/img/fuels/default/'+fuel_type+'.png" /> '+a.price+'лв.',
                    title: a.brand + ' ' + a.name
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
        
        favbrands = window.localStorage.getItem("favbrands");
        
        get_brands();

		$('#savesettings').click(function() {
		    
		    favbrands = [];
		    $("input[name=favbrands]:checked").each(function () {
		        favbrands.push($(this).val());
            });
            //alert(favbrands);
		  	fuel_type = $("#fuelselect option:selected").val();
		   	fuel_name = $("#fuelselect option:selected").text();
			window.localStorage.setItem("fuel_type", fuel_type);
			window.localStorage.setItem("fuel_name", fuel_name);
			window.localStorage.setItem("favbrands", favbrands);
			favbrands = window.localStorage.getItem("favbrands");
			
			$.ajax({
                url: "http://fuelo.net/android/register",
                type: "POST",
                dataType: "text",
                data: { regid: gcm_id, fuel: fuel_type, favbrands: favbrands, lat: mylat, lon: mylon },
                timeout: 5000
	        });

			$.mobile.changePage('#saved', 'pop');
		});
    }

    function refresh_news()
    {
    	$('#refresh_news').empty().append('<a href="#"><i  class="icon-refresh icon-spin icon-large"></i></a>');
    	// Get news by API
	    var request = $.ajax({
            url: "http://fuelo.net/api/news?key=" + apikey,
            type: "GET",
            dataType: "json",
            timeout: 6000
	    });
	     
	    request.done(function(data) {
	        $('#newsFeed').empty();
	        $('#newsFeed').append('<ul id="listview1" data-role="listview">');
	        
	        obj = data.news;
		    for (var i = 0; i < obj.length; i++) {
		        var v = obj[i];
	            $('#newsFeed').append('<li data-role="list-divider">'+v.date+'</li>');
	            $('#newsFeed').append('<li><div style="white-space : normal;">'+v.text+'</div></li>');
            }

            $('#newsFeed').append('</ul>');
		    $('#newsFeed').listview();
		    
		    // Stop spinner
		    $('#refresh_news').empty().append('<a href="#"><i class="icon-refresh icon-large"></i></a>');
	    });
	     
	    request.fail(function(jqXHR, textStatus) {
            alert( "Няма връзка със сървъра. Моля опитайте по-късно.");
            $('#refresh_news').empty().append('<a href="#"><i class="icon-refresh icon-large"></i></a>');
	    });
    }
    

	function nearest_gasstation(latitude,longitude)
	{
		var request = $.ajax({
            url: "http://fuelo.net/api/get_recommended_gasstation",
            type: "POST",
            data: {lat:latitude, lon:longitude, fuel:fuel_type, favbrands: favbrands},
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
		    alert("Няма връзка със сървъра. Моля опитайте по-късно.");
		    $('#nearest_gasstation').empty().append("Няма връзка със сървъра. Моля опитайте по-късно.");
		    $('#refresh').empty().append('<a href="#"><i  class="icon-refresh icon-large"></i></a>');
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
            icon:'http://fuelo.net/img/logos/'+brand+'-shadow.png',
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
		  data: {lat:mylat, lon:mylon, fuel:fuel_type, favbrands: favbrands},
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
						$('#gasoline').collapsible('expand');
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
						$('#diesel').collapsible('expand');
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
						$('#lpg').collapsible('expand');
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
						$('#methane').collapsible('expand');
					}
					//$('#prices_list').collapsible-set('refresh');
					$('#refresh_prices').empty().append('<a href="#"><i class="icon-refresh icon-large"></i></a>');
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
					
					$('#gasstation_location').empty().append('<a href="geo:'+obj.lat+','+obj.lon+'?q='+obj.lat+','+obj.lon+'('+obj.brand_name+' '+obj.gasstation_name+')" data-role="button" data-mini="true"><i class="icon-map-marker"></i> Google Maps</a>');
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
		
		var image = {
	      url: 'http://fuelo.net/img/logos/'+brand+'-shadow.png',
	      size: new google.maps.Size(34, 40),
	      origin: new google.maps.Point(0, 0),
	      anchor: new google.maps.Point(17, 38)
	    };

		var marker=new google.maps.Marker({
		  position:new google.maps.LatLng(latitude,longitude),
		  icon: image,
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
        var image = {
	      url: 'http://fuelo.net/img/logos/'+logo+'-shadow.png',
	      size: new google.maps.Size(34, 40),
	      origin: new google.maps.Point(0, 0),
	      anchor: new google.maps.Point(17, 38)
	    };
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lon),
            icon: image,
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

// Push notification
function onNotificationGCM(e) {
    //alert('EVENT -> RECEIVED:' + e.event);

    switch( e.event )
    {
        case 'registered':
            if ( e.regid.length > 0 )
            {
                // Your GCM push server needs to know the regID before it can push to this device
                // here is where you might want to send it the regID for later use.
                $.ajax({
                    url: "http://fuelo.net/android/register",
                    type: "POST",
                    dataType: "text",
                    data: { regid: e.regid, fuel: fuel_type, favbrands: favbrands, lat: mylat, lon: mylon },
                    timeout: 5000
		        });
		        gcm_id = e.regid;
            }
            break;

        case 'message':
            // if this flag is set, this notification happened while we were in the foreground.
            // you might want to play a sound to get the user's attention, throw up a dialog, etc.
            if ( e.foreground )
            {
                //alert('--INLINE NOTIFICATION--');

                // if the notification contains a soundname, play it.
                //var my_media = new Media("/android_asset/www/"+e.soundname);
                //my_media.play();
            }
            else
            {  // otherwise we were launched because the user touched a notification in the notification tray.
                if ( e.coldstart )
                {
                    $.mobile.changePage('#news');
                }
                else
                {
                    //alert('--BACKGROUND NOTIFICATION--');
                    $.mobile.changePage('#news');
                }
            }

            //alert('MESSAGE -> MSG: ' + e.payload.message);
            break;

        case 'error':
            break;

        default:
            break;
  }
}

function successHandler (result) {
}

function errorHandler (error) {
}
            
function get_brands()
{

	// Get active brands by API
	var request = $.ajax({
        url: "http://fuelo.net/api/brands?key=" + apikey,
        type: "GET",
        dataType: "json",
        timeout: 6000
	});
	 
	request.done(function(data) {
	    //alert(data);
	    $('#brands_list').empty();
	    $('#brands_list').append('<div id="brandsCheckboxes" data-role="fieldcontain">');
	    $('#brands_list').append('<fieldset data-role="controlgroup" data-type="vertical">');
	    $('#brands_list').append('<legend>Любими вериги</legend>');
	    
	    obj = data.brands;
	    var fav = favbrands.split(",");
		for (var i = 0; i < obj.length; i++) {
		    var v = obj[i];

	        $('#brands_list').append('<input id="check'+i+'" name="favbrands" value="'+v.id+'" data-theme="a" type="checkbox">');
	        if (fav.indexOf(v.id) > -1)
            {
                $("#check"+i).attr("checked",true);
            }
            $('#brands_list').append('<label for="check'+i+'"><img src="http://fuelo.net/img/logos/'+v.logo+'-small.png" alt="" /> '+v.name+'</label>');
        }
        $('#brands_list').append('</fieldset>');
        $('#brands_list').append('</div>');
        
		$('#brands_list').trigger('create');
	});
	 
	request.fail(function(jqXHR, textStatus) {
        alert( "Няма връзка със сървъра. Моля опитайте по-късно.");
	});
}
