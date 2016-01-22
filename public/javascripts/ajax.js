$(".chargecomplete").click(function() {

	var charge_id = $(this).parent().attr('id');
	var thisElement = $(this).parent();

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

	var charge_id = $(this).parent().attr('id');
	var thisElement = $(this).parent();

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

	$(this).parent().next().children().children("a.chargecomplete").trigger('click');
	
	$(this).parent().addClass('animated fadeOutRight');
	setTimeout(function(){
		$(this).parent().css('display', 'none');
	}, 1000);

});

$(".chargecancelall").click(function() {

	$(this).parent().next().children().children("a.chargecancel").trigger('click');

	$(this).parent().addClass('animated fadeOutRight');
	setTimeout(function(){
		$(this).parent().css('display', 'none');
	}, 1000);

});