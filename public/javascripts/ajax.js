$(".checkcharge").click(function() {

	var charge_id = $(this).parent().attr('id');

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
});
