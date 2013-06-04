	function get_avg_price()
	{
		// Get near gasstations by ajax
		$.ajax({
			url: 'http://fuelo.net/api/get_avg_price',
			type:'POST',
			dataType: 'text',
			data: { fuel:fuel_type },
			success: function(data){
				var obj = jQuery.parseJSON(data);
					$('#avg_price').empty().append(obj.avg_price);
					window.localStorage.setItem("avg_price", obj.avg_price);
				} // End of success function of ajax form
			}); // End of ajax call 
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
		// Get near gasstations by ajax
		$.ajax({
			url: 'http://fuelo.net/api/get_recommended_gasstations',
			type:'POST',
			dataType: 'text',
			data: { lat:mylat,lon:mylon,fuel:fuel_type },
			success: function(data){
				var obj = jQuery.parseJSON(data);
					$('#gasstations_list').empty().append(obj.list);
					$('#gasstations_list').listview('refresh');
				} // End of success function of ajax form
			}); // End of ajax call 
	}
