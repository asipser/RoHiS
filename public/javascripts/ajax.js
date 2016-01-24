$(".chargecomplete").click(function() {

	var charge_id = $(this).parent().parent().attr('id');
	var thisElement = $(this).parent().parent();
	var chargeAmount = parseFloat($(this).siblings('.listedchargeamount').text());
	console.log(chargeAmount);
	var username = $(this).attr('data').split(' ').join('.');
	var totalAmount = parseFloat($('.dbamount.' + username).text());
	console.log(totalAmount);
	var newAmount = totalAmount - chargeAmount;
	console.log(newAmount);
	console.log(charge_id);

	$.ajax({
		url: '/chargecomplete',
		data: {
			charge_id: charge_id,
			total: "false"
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
	var username = $(this).attr('data').split(' ').join('.');
	var totalAmount = parseFloat($('.dbamount.' + username).text());
	var newAmount = totalAmount - chargeAmount;

	console.log(charge_id);

	$.ajax({
		url: '/chargecancel',
		data: {
			charge_id: charge_id,
			total: "false"
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

	var username = $(this).attr('data').split(' ').join('.');
	console.log(username);
	var subcharges = $('div.listeditem.' + username);
	var totalAmount = parseFloat($('.dbamount.' + username).text());

	var counter = subcharges.length;
	var charge_ids = [];

	var total = "true";

	for(var i=0; i < subcharges.length; i++){
		var charge_id = $(subcharges[i]).attr('id');
		charge_ids.push(charge_id);
	}

	function multiple_charges(charge_id) {

		$.ajax({
			url: '/chargecomplete',
			data: {
				charge_id: charge_id,
				total: total,
				totalAmount: totalAmount
			},
			type: 'POST',
			success: function(data){
				if (data === "Success!") {
					console.log("Success!");
					counter -= 1;
					total = "sent";
					
					if (counter > 0) {
						multiple_charges(charge_ids.shift());
					}
				}
			},
			error: function(xhr, status, error) {
				console.log("A problem occurred.");
			}
		});
	}

	multiple_charges(charge_ids.shift());
	//}


	$('div.ui.card.' + username).addClass('animated fadeOutRight');
	setTimeout(function(){
		$('div.ui.card.' + username).css('display', 'none');
	}, 1000);
});

$(".chargecancelall").click(function() {

	var username = $(this).attr('data').split(' ').join('.');
	console.log(username);
	var subcharges = $('div.listeditem.' + username);
	var totalAmount = parseFloat($('.dbamount.' + username).text());

	for(var i=0; i < subcharges.length; i++){
		var charge_id = $(subcharges[i]).attr('id');

		var total;

		if (i === 0) {
			total = "true";
		} else {
			total = "sent";
		}

		$.ajax({
			url: '/chargecancel',
			data: {
				charge_id: charge_id,
				total: total,
				totalAmount: totalAmount
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
