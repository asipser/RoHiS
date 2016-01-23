$(".chargecomplete").click(function() {

	var charge_id = $(this).parent().parent().attr('id');
	var thisElement = $(this).parent().parent();
	var chargeAmount = parseFloat($(this).siblings('.listedchargeamount').text());
	console.log(chargeAmount);
	var username = $(this).attr('data');
	var totalAmount = parseFloat($('.dbamount.' + username).text());
	console.log(totalAmount);
	var newAmount = totalAmount - chargeAmount;
	console.log(newAmount);
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
				$('.dbamount.' + username).text(newAmount.toFixed(2));
				setTimeout(function(){
					thisElement.css('display', 'none');
				}, 1000);
			}
		},
		error: function(xhr, status, error) {
			console.log("A problem occurred" + error);
		}
	});
	if(newAmount == 0){
		$('div.ui.card.' + username).addClass('animated fadeOutRight');
		setTimeout(function(){
			$('div.ui.card.' + username).css('display', 'none');
		}, 1000);
	}else if(newAmount < 0){
		location.reload();
	}
});

$(".chargecancel").click(function() {

	var charge_id = $(this).parent().parent().attr('id');
	var thisElement = $(this).parent().parent();

	var charge_id = $(this).parent().parent().attr('id');
	var thisElement = $(this).parent().parent();
	var chargeAmount = parseFloat($(this).siblings('.listedchargeamount').text());
	var username = $(this).attr('data');
	var totalAmount = parseFloat($('.dbamount.' + username).text());
	var newAmount = totalAmount - chargeAmount;

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
				$('.dbamount.' + username).text(newAmount.toFixed(2));
				setTimeout(function(){
					thisElement.css('display', 'none');
				}, 1000);
			}
		},
		error: function(xhr, status, error) {
			console.log("A problem occurred.");
		}
	});
	if(newAmount == 0){
		$('div.ui.card.' + username).addClass('animated fadeOutRight');
		setTimeout(function(){
			$('div.ui.card.' + username).css('display', 'none');
		}, 1000);
	}else if(newAmount < 0){
		location.reload();
	}
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

	// $("#email_change_button").click(function() {

	// 	var emailcheck = $("#emailcheck").val();

	// 	$.ajax({
	// 			url: '/settings/email',
	// 			data: {
	// 				emailcheck: emailcheck
	// 			},
	// 			type: 'POST',
	// 			success: function(data){
	// 				if (data === "Success!") {
	// 					$("#email_change_success").text("Success!");
	// 				}
	// 			},
	// 			error: function(xhr, status, error) {
	// 				console.log("A problem occurred.");
	// 			}
	// 		});
	// });

	//});
