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
		$(this).removeClass('massive');
		$('#precharge').css('margin-top','-37px');
		$('#precharge').css('margin-bottom','0');
		$(this).text('Charge!');
		setTimeout(function(){
			$('#submitchargebutton').css('opacity', '1');
		}, 1000);
		setTimeout(function(){
			$('precharge').css('display', 'hidden');
		}, 1000);
	})
	$('p').popup();
});