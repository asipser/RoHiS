$(document).ready(function(){
	$('#sidebarmenuitem').click(function(){
		$('div.ui.sidebar').sidebar('toggle');
	});
	$('.ui.accordion').accordion();
	$('.ui.dropdown').dropdown();
	$('.ui.form.charge').form({
		fields: {
			borroworlent: 'empty',
			amount		: 'empty',
			user		: 'empty',
			note		: 'empty'
		}
	});
	$('#makechargebutton').click(function(){
		$('#chargeformwrapper').addClass('expansion');
	})
	$('p').popup();
});