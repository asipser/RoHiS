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

	var notFormUserName = 'not[' + $('#getusername').text() + ']';
	$('.ui.form.charge').form({
		fields: {
			borroworlent: {
				identifier: 'borroworlent',
				rules: [{
					type: 'empty',
					prompt: 'Please choose where you borrowed or lent the charge amount' 
				}]
			},
			amount		: {
				identifier: 'amount',
				rules: [{
					type: 'empty',
					prompt: 'Please enter a charge amount'
				}]
			},
			user		: {	
				identifier: 'user',
				rules: [{
					type: 'empty',
					prompt: 'Please enter a username'
				},
				{
					type: notFormUserName,
					prompt: 'You cannot charge yourself'
				},{
					type: 'regExp[^[a-zA-Z0-9_]*$]',
					prompt: 'Username can only contain letters, numbers, and certain special characters'
				}]
			},
			note		: {
				identifier: 'note',
				rules: [{
					type: 'empty',
					prompt: 'Please enter a note'
				},{
					type: 'regExp[^[a-zA-Z0-9\\-\\s]+$]',
					prompt: 'The note can only contain letters, numbers, and certain special characters'
				}]
			}
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
		$('#splitchargebutton').addClass('animated fadeOutRight').removeClass('massive');
		$('#chargeformwrapper').addClass('expansion');
		$(this).removeClass('massive');
		$('#precharge').css('margin-top','-37px');
		$('#precharge').css('margin-bottom','-10vh');
		$('#precharge').css('max-height','0');
		$(this).text('Charge!');
		$(this).css('margin-left', '6.9vw');
		setTimeout(function(){
			$('#submitchargebutton').css('opacity', '1');
		}, 1000);
		setTimeout(function(){
			$('#chargeformwrapper').css('overflow', 'visible');
		}, 1000);
		setTimeout(function(){
			$('#precharge').hide();
		}, 1050);
	});

	$('#splitchargebutton').click(function(){
		$('#precharge').css('max-height', 0);
		$('#makechargebutton').addClass('animated fadeOutLeft');
		$(this).addClass('animated fadeOutRight');
		$('#splitformwrapper').css('max-height','100vh');
		setTimeout(function(){
			$('#precharge').hide();
		}, 700);
		setTimeout(function(){
			$('#splitformwrapper').css('overflow', 'visible');
		}, 1000);
	});

	$('#addnewcardbutton').click(function(){

		var numCards = $(this).parent().parent().siblings().length;
		if(numCards===8){
			$(this).parent().parent().hide();
		}
		$('#addbuttoncard').before('<div class="standard card"> \
			<div class="content"> \
				<div class="ui compact search labeled input field"> \
					<input oninput="starCheck($(this))" type="text" name="user" placeholder="Username" class="prompt usercardinput"></input> \
					<div onclick="starCheckOnDropdown($(this))" class="results"></div> \
				</div> \
				<span class="right floated meta"><div onclick="exitCard($(this))" class="ui mini icon circular button"><i class="remove icon"></i></div></span> \
			</div> \
			<div class="content"> \
				<i class="massive smile icon"></i> \
			</div> \
			<div class="extra content"> \
				<span class="right floated starspan">Paid the bill <i onclick="starClick($(this))" class="empty star icon"></i></span> \
			</div> \
		</div>');
		
		$('.ui.search')
		.search({
			apiSettings: {
				url: '/usersearch?name={query}'
			},
			fields: {
				results : 'items',
				title   : 'username',
				description     : 'full_name'
			},
			minCharacters : 2
		});
	});

	$('.cancelbutton').click(function(){
		location.reload();
	});

	$('#steponedonebutton').click(function(){
		$('.ui.compact.error.message').empty();
		$('.ui.compact.error.message').hide();
		var userData = [];
		var userCardInputs = $('.usercardinput');
		if(userCardInputs.length){
			var filledInput = false;
			var filledPayer = false;
			var noMatches = true;
			var stars = $('.star.icon');

			userData[0] = {
				username: $('#getusername').text(),
				payer: !($(stars[0]).hasClass('empty'))
			}
			filledPayer = userData[0].payer;

			for(var i=1;i<stars.length;i++){
				userData[i] = {
					username: $(userCardInputs[i-1]).val(),
					payer: !($(stars[i]).hasClass('empty'))
				}

				filledInput = Boolean(userData[i].username);
				if(!filledPayer){
					filledPayer = userData[i].payer;
				}
			}

			for(var i=0;i<userData.length;i++){
				for(var j=i+1;j<userData.length;j++){
					if(noMatches && userData[i].username === userData[j].username){
						noMatches = false;
					}
				}
			}

			if(!noMatches){
				$('.ui.compact.error.message').append('<p>You cannot input the same user more than once!</p>');
				$('.ui.compact.error.message').show();
			}

			if(!filledInput){
				// console.log('Each person must have a username!');
				$('.ui.compact.error.message').append('<p>Each person must have a username!</p>');
				$('.ui.compact.error.message').show();
			}
			if(!filledPayer){
				// console.log('Someone must be chosen as the payer!');
				$('.ui.compact.error.message').append('<p>Someone must be chosen as the payer!</p>');
				$('.ui.compact.error.message').show();
			}
			if(filledInput && filledPayer && noMatches){
				$('#step2tab').removeClass('disabled');
				$('#step2tab').click();
				$('#step1tab').addClass('disabled');
				setUpStep2Tab(userData);
			}
		}else{
			// console.log('Not enough users!');
			$('.ui.compact.error.message').append('<p>Not enough users!</p>');
			$('.ui.compact.error.message').show();
		}
		// console.log(userData);
	});

	var setUpStep2Tab = function(userData){
		console.log(userData);
		$('#numpeoplesplit').text(userData.length);

		for(var i=0;i<userData.length;i++){
			var username = userData[i].username;
			var payer = userData[i].payer;
			step2AddCard(username, payer);

			$('#participantdropdown').append("<option value='" + username + "'>" + username + "</option>");
		}

		$('input[type="number"]').keydown(function(e){
		   var ingnore_key_codes = [189];
		   if ($.inArray(e.keyCode, ingnore_key_codes) >= 0){
		      e.preventDefault();
		   }
		});
	};
	
	var step2AddCard = function(username, payer){
		if(payer){
			$('#step2cards').prepend("<div class='ui yellow card' id='" + username + "'> \
								<div class='content'> \
									<div class='header'>" + username + "<span class='right floated meta'>Paid the bill <i class='star icon'></i></span></div> \
								</div> \
								<div class='content sharedcharges " + username + "'>No shared charges yet!</div> \
								<div class='content'> \
									<div class='ui transparent fluid left icon input'> \
										<i class='dollar icon'></i> \
										<input type='number' class='indcharge " + username + "' min='0.01' max='999.99' step='0.01' oninput='chargeOnChange($(this))' name='amount' placeholder='Individual charges'> \
									</div> \
								</div> \
							</div>");
		}else{
			$('#step2cards').append("<div class='card' id='" + username + "'> \
								<div class='content'> \
									<div class='header'>" + username + "</div> \
								</div> \
								<div class='content sharedcharges " + username + "'>No shared charges yet!</div> \
								<div class='extra content'> \
									<div class='ui transparent fluid left icon input'> \
										<i class='dollar icon'></i> \
										<input type='number' class='indcharge " + username + "' min='0.01' max='999.99' step='0.01' oninput='chargeOnChange($(this))' name='amount' placeholder='Individual charges'> \
									</div> \
								</div> \
							</div>")
		}
	}

	$('#sharedchargebutton').click(function(){
		$('#sharedchargeform').show();
	});

	$('#submitsharedchargebutton').click(function(){
		$(this).siblings('.ui.error.message').hide();
		var charge = parseFloat($('#sharedchargeamount').val());
		var participants = $('#participantdropdown').val();

		if(!(participants && charge)){
			$(this).siblings('.ui.error.message').show();
		}else{
			var numParticipants = participants.length;
			var chargePerPerson = charge/numParticipants;
			console.log(chargePerPerson);
			for(var i=0; i<numParticipants;i++){
				var user = participants[i];
				var currentAmount = $('div.content.sharedcharges.' + user).text();
				console.log(currentAmount);
				if(currentAmount == "No shared charges yet!"){
					$('div.content.sharedcharges.' + user).text(chargePerPerson.toFixed(2));
				}else{
					currentAmount = parseFloat(currentAmount);
					$('div.content.sharedcharges.' + user).text((chargePerPerson + currentAmount).toFixed(2));
				}
			}
			$('#sharedchargeamount').val('');
			$('#participantdropdown').dropdown('clear');
			$('#sharedchargeform').hide();
		}

		chargeOnChange();
	});
	
	$('#cancelsharedchargebutton').click(function(){
		$(this).siblings('.ui.error.message').hide();
		$('#sharedchargeamount').val('');
		$('#participantdropdown').dropdown('clear');
		$('#sharedchargeform').hide();
	});

	$('#step2nextbutton').click(function(){
		var leftover = parseFloat($('#totalshared').text());
		if(leftover > 0){
			var payerCard = $('div.ui.yellow.card');
			var userCards = $(payerCard).siblings();
			var payer = $(payerCard).attr('id');
			console.log(payer);
			var leftoversplit = leftover/(userCards.length + 1);

			var userData = [];

			for(var i=0;i<userCards.length;i++){
				var currentCard = userCards[i];
				var currentUser = $(currentCard).attr('id');
				var sharedCharge = parseFloat($('div.content.sharedcharges.' + currentUser).text());
				var indCharge = parseFloat($('input.indcharge.' + currentUser).val());
				var debt = 0;
				if(sharedCharge)
					debt += sharedCharge;
				if(indCharge)
					debt += indCharge;
				debt += leftoversplit;

				userData[i] = {
					username: currentUser,
					charge: debt
				}
			}

			console.log(userData);

			$('#step3tab').removeClass('disabled');
			$('#step3tab').click();
			$('#step2tab').addClass('disabled');
			setUpStep3Tab(userData, payer);
		}else{
			// ERROR MESSAGE
		}
	});

	var setUpStep3Tab = function(userData, payer){
		for(var i=0;i<userData.length;i++){
			var username = userData[i].username;
			var debt = (userData[i].charge).toFixed(2);
			$('#step3cards').append("<div class='ui card' id='" + username + "'> \
								<div class='content'> \
									<div class='header'>" + username + "</div> \
								</div> \
								<div class='content'> \
									<div class='ui statistic'><div class='label'>owes</div><div class='value'>$" + debt + "</div></div> \
								</div> \
								<div class='content'> \
									to " + payer + " \
								</div> \
							</div>");
		}

		$('#step3confirmbutton').click(function(){

			console.log("You made it!");

			var fakeNote = "fake note"

			var counter = userData.length;
			var chargeObjects = [];

			for(var i=0;i<userData.length;i++){
				var chargeObject = {
					recipient: payer,
					payer: userData[i].username,
					amount: userData[i].charge,
					note: fakeNote
				}

				chargeObjects.push(chargeObject);
			}

			function split_charge(chargeObject) {

				$.ajax({
					type: "POST",
					url: '/payments/addsplitcharge',
					data: chargeObject,
					success: function(data){
						if (data === "Success!") {
							console.log("Success!");
							counter -= 1;

							if (counter > 0) {
								var current_object = chargeObjects.shift();
								current_object['counter'] = counter;
								split_charge(current_object);
							}else{
								location.reload();
							}
						}
					},
					error: function(xhr, status, error) {
						console.log("A problem occurred" + error);
					}
				});
			}

			var current_object = chargeObjects.shift();
			current_object['counter'] = counter;
			split_charge(current_object);
		});
	}

	$('.tabular.menu .item').tab();

	$('.listeditem').popup();
	
	$('.ui.search')
	.search({
		apiSettings: {
			url: '/usersearch?name={query}'
		},
		fields: {
			results : 'items',
			title   : 'username',
			description     : 'full_name'
		},
		minCharacters : 2
	});

	var $chargeamounts = $('.listedchargeamount');
	for(i=0; i<$chargeamounts.length; i++){
		var amount = $chargeamounts[i];
		if(	$(amount).text().charAt(0) == '-'){
			$(amount).css('color', 'red');
		}
		$(amount).text(parseFloat($(amount).text()).toFixed(2));
	};

	$('.ui.form.changepassword').form({
		on: 'blur',
		fields: {
			match: {
				identifier  : 'confirmpassword',
				rules: [
				{
					type   : 'match[newpassword]',
					prompt : 'Please put the same value in both fields'
				}
				]
			},
			newpassword: {
				identifier: 'newpassword',
				rules: [
				{
					type : 'empty',
					prompt: 'Please enter a password' 
				},
				{
					type: 'minLength[6]',
					prompt : 'Your password must be at least {ruleValue} characters'
				}
				]
			}
		}
	});

	var $amounts = $('.dbamount')
	for(var i=0;i<$amounts.length;i++){
		var currentAmount = $amounts[i];
		$(currentAmount).text(
		parseFloat($(currentAmount).text()).toFixed(2)
		);
	};

	if($('#venmobool').attr('data') == 'true'){
		$('#venmobool').removeClass('disabled');
	}else{
		$('#venmobool').popup();
	};
	if($('#emailcheck').attr('data') == 'true'){
		$('div.ui.toggle.checkbox').checkbox('check');
	}else{
		$('div.ui.toggle.checkbox').checkbox('uncheck');
	}

	var stats = $('div.statisticspage.value');
	for(var i=0;i<stats.length;i++){
		if($(stats[i]).attr('data'))
			$(stats[i]).text(parseFloat($(stats[i]).attr('data')).toFixed(2));
	}

	$('.historicalcharges').popup();

	var historyChargeAmounts = $('.historychargeamount');
	for(var i=0;i<historyChargeAmounts.length;i++){
		$(historyChargeAmounts[i]).text(parseFloat($(historyChargeAmounts[i]).text()).toFixed(2));
	}

	$('input[type="number"]').keydown(function(e){
	   var ingnore_key_codes = [189];
	   if ($.inArray(e.keyCode, ingnore_key_codes) >= 0){
	      e.preventDefault();
	   }
	});

	$('.venmocompletebutton').click(function(){
		var username = $(this).attr('data');
		var totalAmount = $('.dbamount.' + username).text();

		$('#venmocompleteuser').text(username);
		$('#venmocompleteamount').text(totalAmount);
		$('.ui.modal.venmocomplete').modal('show');

		$('#venmocompletesubmit').click(function(){
			var description = $('#venmocompletenote').val();
			console.log(description);
			$.ajax({
				type: 'POST',
				url: '/venmo/completeall',
				data: {
					user: username,
					amount: totalAmount,
					note: description
				},
				success: function(data){
					if(data === "Success!"){
						console.log(data);
						$('.ui.modal.venmocomplete').modal('hide');
						$('.chargecompleteall.' + username).click();
					}else{
						console.log("Something wrong with the data: " + data);
					}
				},
				error: function(xhr, status, error){
					console.log("A problem occurred: " + error);
				}
			});
		});
	});

	$('.venmorequestbutton').click(function(){
		var username = $(this).attr('data');
		var totalAmount = $('.dbamount.' + username).text();

		$('#venmorequestuser').text(username);
		$('#venmorequestamount').text(totalAmount);
		$('.ui.modal.venmorequest').modal('show');

		$('#venmorequestsubmit').click(function(){
			var description = $('#venmorequestnote').val();
			console.log(description);
			$.ajax({
				type: 'POST',
				url: '/venmo/requestall',
				data: {
					user: username,
					amount: totalAmount,
					note: description
				},
				success: function(data){
					if(data === "Success!"){
						console.log(data);
						location.reload();
					}else{
						console.log("Something wrong with the data: " + data);
					}
				},
				error: function(xhr, status, error){
					console.log("A problem occurred: " + error);
				}
			});
		});
	});

	if($('#venmobool').attr('data') == 'true'){
		var requestButtons = $('.venmorequestbutton');
		console.log(requestButtons);
		var completeButtons = $('.venmocompletebutton');
		console.log(completeButtons)

		var counter_1 = requestButtons.length;
		var users_1 = [];

		for(var i=0;i<requestButtons.length;i++){
			var currentButton = $(requestButtons[i]);
			var currentUser = $(currentButton).attr('data');
			users_1.push({currentUser: currentUser, currentButton: currentButton});
		}

		function multiple_calls_1(currentCharge) {

			$.ajax({
				type: 'GET',
				url: '/isUser',
				data: {
					username: currentCharge['currentUser']
				},
				success: function(data){
					console.log(currentCharge['currentUser'] + data);
					if(data){
						$(currentCharge['currentButton']).removeClass('disabled');
					}

					counter_1 -= 1;
					if (counter_1 > 0) {
						multiple_calls_1(users_1.shift());
					}
				}
			});
		}
		if(requestButtons.length){
			multiple_calls_1(users_1.shift());
		}

		var counter_2 = completeButtons.length;
		var users_2 = [];
		
		for(var i=0;i<completeButtons.length;i++){
			var currentButton2 = $(completeButtons[i]);
			var currentUser2 = $(currentButton2).attr('data');
			users_2.push({currentUser2: currentUser2, currentButton2: currentButton2});
		}

		function multiple_calls_2(currentCharge2) {

			$.ajax({
				type: 'GET',
				url: '/isUser',
				data: {
					username: currentCharge2['currentUser2']
				},
				success: function(data){
					console.log(currentCharge2['currentUser2'] + data);
					if(data){
						$(currentCharge2['currentButton2']).removeClass('disabled');
					}

					counter_2 -= 1;
					if (counter_2 > 0) {
						multiple_calls_2(users_2.shift());
					}
				},
				error: function(xhr, status, error) {
					console.log("A problem occurred" + error);
				}
			});
		}

		if(completeButtons.length){
			multiple_calls_2(users_2.shift());
		}
	};

	if($('#venmobool').attr('data') == 'false'){
		$('.venmopopup').popup();
	}
});