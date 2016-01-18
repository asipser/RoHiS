$('a.item').click(function(){
	$('a.item').removeClass("active");
	$(this).addClass("active");
});
$('#getstartedbutton').click(function(){
	$('.ui.modal').modal('show');
});
