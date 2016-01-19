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
	$('#aboutpanel').show();
	$('html,body').animate({
		scrollTop: window.innerHeight
	}, 1000);
});
$('#downarrow').click(function(){
	$('#aboutpanel').show();
	$('html,body').animate({
		scrollTop: window.innerHeight
	}, 1000);
});
var $win = $(window);
$win.scroll(function(){
	if($win.scrollTop() == 0){
		$('#aboutpanel').hide();
		$('a.item').removeClass("active");
		$('#homemenuitem').addClass("active");
	}
});
$('#sidebarmenuitem').click(function(){
	$('div.ui.sidebar').sidebar('toggle');
});
$('.ui.accordion.title').click(function(){
	console.log('fslkjfl');
	if($(this).hasClass('active')){
		$('div.accordion.title').removeClass('active');
		$(this).addClass('active');
	}
});