$('a.item').click(function(){
	$('a.item').removeClass("active");
	$(this).addClass("active");
});
$('#getstartedbutton').click(function(){
	$('.ui.modal.signup').modal('show');
});
$('#loginbutton').click(function(){
	$('.ui.modal.login').modal('show');
});
$('#aboutmenuitem').click(function(){
	$('html,body').animate({
		scrollTop: window.innerHeight
	}, 1000);
});
$('#downarrow').click(function(){
	$('html,body').animate({
		scrollTop: window.innerHeight
	}, 1000);
});

