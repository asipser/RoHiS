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
	      firstName	: {
	      	identifier: 'firstName',
	      	rules: [{
	      		type: 'empty',
					prompt: 'Please enter a first name'
				},
				{
					type: 'regExp[/^[a-z ,.\'-]+$/i]',
					prompt: 'First name can only contain letters, numbers, and certain special characters'
	      	}]
	      },	
	      lastName	: {
	      	identifier: 'lastName',
	      	rules: [{
	      		type: 'empty',
					prompt: 'Please enter a last name'
				},
				{
					type: 'regExp[/^[a-z ,.\'-]+$/i]',
					prompt: 'Last name can only contain letters, numbers, and certain special characters'
	      	}]
	      },
	      username	: {
	      	identifier: 'username',
	      	rules: [{
	      		type: 'empty',
					prompt: 'Please enter a username'
				},
				{
					type: 'regExp[^[a-zA-Z0-9_]*$]',
					prompt: 'Username can only contain letters, numbers, and certain special characters'
	      	}]
	      },
	      email		: {
	      	identifier: 'email',
	      	rules: [{
	      		type: 'empty',
					prompt: 'Please enter an email'
				},
				{
					type: 'email',
					prompt: 'Email must be correctly formed'
	      	}]
	      },
	      password	: {
	      	identifier: 'password',
	      	rules: [{
	      		type: 'empty',
					prompt: 'Please enter a password'
				},
				{
					type: 'minLength[6]',
					prompt: 'Password must be at least {ruleValue} characters long'
	      	}]
	      }
	    }
	});
	$('.ui.form.login').form({
	    fields: {
	      username	: {
	      	identifier: 'username',
	      	rules: [{
	      		type: 'empty',
					prompt: 'Please enter a username'
				},
				{
					type: 'regExp[^[a-zA-Z0-9_]*$]',
					prompt: 'Username can only contain letters, numbers, and certain special characters'
	      	}]
	      },
	      password	: {
	      	identifier: 'password',
	      	rules: [{
	      		type: 'empty',
					prompt: 'Please enter a password'
			}]
	      }
	    }
	});
	$('.ui.dropdown').dropdown();
	$('.ui.modal').modal({
        onApprove : function() {
          $('.ui.form').submit();
          return false;
        }
    });

	$('.listeditem').popup();
	$('.venmopopup').popup();
});