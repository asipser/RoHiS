$(document).ready(function(){
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
	$('#noaccountbutton').click(function(){
		$('.ui.modal.login').modal('hide');
		$('.ui.modal.signup').modal('show');
	});
	$('#alreadyhaveaccount').click(function(){
		$('.ui.modal.signup').modal('hide');
		$('.ui.modal.login').modal('show');
	});
	$('#recoverylink').click(function(){
		$('.ui.modal.login').modal('hide');
		$('.ui.modal.recovery').modal('show');
	})
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
			$('a.item').removeClass("active");
			$('#homemenuitem').addClass("active");
		}
		if($win.scrollTop() < 360)
			$('#downarrow').css('opacity', (350-$win.scrollTop())/350);
	});
	$('.ui.form.signup').form({
	    fields: {
	      firstName	: 'empty',
	      lastName	: 'empty',
	      username	: 'empty',
	      email		: 'email',
	      password	: ['minLength[6]', 'empty']
	    }
	});
	$('.ui.form.login').form({
	    fields: {
	      username	: 'empty',
	      password	: 'empty'
	    }
	});
	$('.ui.dropdown').dropdown();
	$('.ui.modal').modal({
        onApprove : function() {
          $('.ui.form').submit();
          return false;
        }
    });

});