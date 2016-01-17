$('a.item').click(function(){
	$('a.item').removeClass("active");
	$(this).addClass("active");
});