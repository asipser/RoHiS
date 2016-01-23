$(".chargecomplete").click(function() {

	var charge_id = $(this).parent().parent().attr('id');
	var thisElement = $(this).parent().parent();

	console.log(charge_id);

	$.ajax({
			url: '/chargecomplete',
			data: {
				charge_id: charge_id
			},
			type: 'POST',
			success: function(data){
				if (data === "Success!") {
					console.log("Success!");
					thisElement.addClass('animated fadeOutRight');
					setTimeout(function(){
						thisElement.css('display', 'none');
					}, 1000);
				}
			},
			error: function(xhr, status, error) {
				console.log("A problem occurred.");
			}
		});
});

$(".chargecancel").click(function() {

	var charge_id = $(this).parent().parent().attr('id');
	var thisElement = $(this).parent().parent();

	console.log(charge_id);

	$.ajax({
			url: '/chargecancel',
			data: {
				charge_id: charge_id
			},
			type: 'POST',
			success: function(data){
				if (data === "Success!") {
					console.log("Success!");
					thisElement.addClass('animated fadeOutRight');
					setTimeout(function(){
						thisElement.css('display', 'none');
					}, 1000);
				}
			},
			error: function(xhr, status, error) {
				console.log("A problem occurred.");
			}
		});
});

$(".chargecompleteall").click(function() {

	var username = $(this).attr('data');
	var subcharges = $('div.listeditem.' + username);

	for(var i=0; i < subcharges.length; i++){
		var charge_id = $(subcharges[i]).attr('id');
		console.log(charge_id);
		$.ajax({
			url: '/chargecomplete',
			data: {
				charge_id: charge_id
			},
			type: 'POST',
			success: function(data){
				if (data === "Success!") {
					console.log("Success!");
				}
			},
			error: function(xhr, status, error) {
				console.log("A problem occurred.");
			}
		});
	}
	$('div.ui.card.' + username).addClass('animated fadeOutRight');
	setTimeout(function(){
		$('div.ui.card.' + username).css('display', 'none');
	}, 1000);
});

$(".chargecancelall").click(function() {

	var username = $(this).attr('data');
	var subcharges = $('div.listeditem.' + username);
	for(var i=0; i < subcharges.length; i++){
		var charge_id = $(subcharges[i]).attr('id');

		$.ajax({
			url: '/chargecancel',
			data: {
				charge_id: charge_id
			},
			type: 'POST',
			success: function(data){
				if (data === "Success!") {
					console.log("Success!");
				}
			},
			error: function(xhr, status, error) {
				console.log("A problem occurred.");
			}
		});
	}
	$('div.ui.card.' + username).addClass('animated fadeOutRight');
	setTimeout(function(){
		$('div.ui.card.' + username).css('display', 'none');
	}, 1000);
});