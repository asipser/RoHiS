$(document).ready(function(){
	$('#topbarmenuitem').popup({
		inline	: true,
		hoverable: true,
		position: 'bottom left',
		delay: {
			hide: 300
		}
	});
	$('.ui.accordion').accordion();
	$('.ui.dropdown').dropdown();
	$('.ui.checkbox').checkbox();
	$('.ui.form.charge').form({
		fields: {
			borroworlent: 'empty',
			amount		: 'empty',
			user		: 'empty',
			note		: 'empty'
		}
	});
	$('#borroworlent').change(function(){
		console.log($(this)[0].value);
		if($(this)[0].value == 'true')
			$('#tofrom').text('to');
		else
			$('#tofrom').text('from');
	});
	$('#makechargebutton').click(function(){
		$('#chargeformwrapper').addClass('expansion');
		$(this).removeClass('massive');
		$('#precharge').css('margin-top','-37px');
		$('#precharge').css('padding-bottom','0');
		$(this).text('Charge!');
		setTimeout(function(){
			$('#submitchargebutton').css('opacity', '1');
		}, 1000);
		setTimeout(function(){
			$('#precharge').hide();
		}, 1020);
	})
	$('p').popup();

	
	$('.ui.search')
	  .search({
	    apiSettings: {
	      url: '/usersearch?name={query}'
	    },
	    fields: {
	      results : 'items',
	      title   : 'full_name',
	      description     : 'username'
	    },
	    minCharacters : 2
	  })
	;
});