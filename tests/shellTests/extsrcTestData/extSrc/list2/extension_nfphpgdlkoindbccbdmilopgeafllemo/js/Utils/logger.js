function Logger() {

	var isLoggerEnabled = true;
	var self = this;

	self.init = function () {

		self.loggerModdel = new LoggerModel();
		self.userInfo = ko.observable();
		self.allowLogg = ko.observable(false);
		self.subscribeToMyProperties();
	};

	var loggerUrl = "https://api.logger.mv-nordic.com/log_event";

	var logEvents = {
		added_hashtag: "added_hashtag_event",
		added_star: "added_star_event",
		change_profile: "change_profile_event",	   	 
		change_settings: "change_settings_event",
		choose_app: "choose_app_event",
		choose_word: "choose_word_event",
		press_play: "press_play_event",
		press_terms: "press_terms_event"
	};

	var settingNames = {
		isPredictionVisible: "showWordlist",
		showAlternatives: "showAlternative",
		isPredictNextWord: "predictNextWord",
		highlightStrategy: "highlightStrategy",
		readingStrategy: "readingStrategy",
		voiceSpeed: "voiceSpeed",
		readWordAfterType: "readWhileTypingWord",
		readSentanceAfterType: "readWhileTypingSentence",
		readLetterNameTyping: "letterName",
		readLetterSoundTyping: "letterSound"
	};

	var selectionMethod = {
		mouse_click: "mouse_click", 
		keyboard_shortcut: "keyboard_shortcut"
	};

	var applicationNames = {
		intowords_chrome_dev : "intowords_chrome_dev",
		intowords_chrome_live : "intowords_chrome_live"
	};

	var allowedTopDomains = ["se", "no", "dk"];
	/*Great Britain domain_name: "gb"
	Føroyar domain_name: "fo"
	Sverige domain_name: "se"
	Kalaallit Nunaat domain_name: "gl"
	Suomi domain_name: "fi"
	Norge domain_name: "no"
	Danmark domain_name: "dk"
	Nederland domain_name: "nl"
	Россия domain_name: "ru"
	com domain_name: "com"
	USA domain_name: "us"
	Deutschland domain_name: "de" */

	// Creates string according to provided format.
	// Example: String.format("This is {0} about {1}.", "message", "something"); Result: "This is message about something" 
	self.stringFormat = function (format) {

		var args = Array.prototype.slice.call(arguments, 1);
		var sprintfRegex = /\{(\d+)\}/g;

		var sprintf = function (match, number) {
			return number in args ? args[number] : match;
		};

		return format.replace(sprintfRegex, sprintf);
	};

	self.getUserInfo = function () {
		ClientManager.getInstance().permission.whoAmI(function (result) {
			chrome.runtime.sendMessage({ action: 'Background.isLoggingAllowed'}, function(isLoggingAllowed) {
				self.userInfo(result);            
				self.loggerModdel.username(self.userInfo().uid);
				self.loggerModdel.domain(self.userInfo().domain);
				self.allowLogg(isLoggingAllowed);
				self.loggerModdel.session_id(Settings.getInstance().getSessionID());
				self.loggerModdel.application_name(applicationNames.intowords_chrome_dev)
			});
		});
	};

	self.prepareData = function (sendData) {

		var mainData = {
			timestamp: new Date(),
			session_id: self.loggerModdel.session_id(),
			version: self.loggerModdel.version(),            
			username: self.loggerModdel.username(),
			domain: self.loggerModdel.domain(),
			application_name: self.loggerModdel.application_name(),
			language: self.loggerModdel.active_profile().lang_code
		};

		$.extend(sendData, mainData);
	};

	self.getResponseSync = function (options) {

		var result = null;
		options = $.extend(
		{
			async: false,
			callback: function (jsonData) { result = jsonData; }
		}, options);

		self.getResponseAsync(options);

		return result;
	};

	self.getResponseAsync = function (options) {

		if(!(isLoggerEnabled && self.allowLogg())){
			return;
		};
		// Options
		options = $.extend({
			async: true,
			global: true,
			callback: function () { }
		}, arguments[0] || {});

		var actualUrl = options.url;

		// Send ajax request
		$.ajax({
			contentType: options.contentType || "application/x-www-form-urlencoded",
			//dataType: options.dataType || "json", //tells the server what kind of response it will accept in return
			cache: false,
			type: options.type,
			data: options.data,
			url: actualUrl,
			async: options.async,
			global: options.global,
			success: function (jsonData) {

				// Call the callback
				options.callback.call(this, jsonData);

			},
			error: function (xhr, textStatus, errorThrown ) {

				// Get XHR status
				var xhrStatus = xhr.status;
				console.log(self.stringFormat("ErrorStatus: {0} ,ErrorThrown: {1}", textStatus, errorThrown));
				switch (xhrStatus) {
					case 401:
					case 403:
					break;

				}
			}
		});
	};

	self.subscribeToMyProperties = function () {

		if(isLoggerEnabled && self.allowLogg()){
			self.added_hashtagSubscription = self.loggerModdel.added_hashtag.subscribe(self.logAdded_hashtag);
			self.added_starSubscription = self.loggerModdel.added_star.subscribe(self.logAdded_star);
			self.choose_appSubscription = self.loggerModdel.choose_app.subscribe(self.logChoose_app);
			self.isPredictionVisibleSubscription = self.loggerModdel.isPredictionVisible.subscribe(self.logIsPredictionVisible);
			self.showAlternativesSubscription = self.loggerModdel.showAlternatives.subscribe(self.logShowAlternatives);
			self.isPredictNextWordSubscription = self.loggerModdel.isPredictNextWord.subscribe(self.logIsPredictNextWord);
			self.highlightStrategySubscription = self.loggerModdel.highlightStrategy.subscribe(self.logHighlightStrategy);
			self.readingStrategySubscription = self.loggerModdel.readingStrategy.subscribe(self.logReadingStrategy);                    
			self.voiceSpeedSubscription = self.loggerModdel.voiceSpeed.subscribe(self.logVoiceSpeed);
			self.profile_settingsSubscription = self.loggerModdel.profile_settings.subscribe(self.logProfile_settings);
			self.press_playSubscription = self.loggerModdel.press_play.subscribe(self.logPressPlay);
			self.press_termsSubscription = self.loggerModdel.press_terms.subscribe(self.logPressTerms);
			self.chosen_wordSubscription = self.loggerModdel.chosen_word.subscribe(self.logChosen_word);
			self.readWordAfterTypeSubscription = self.loggerModdel.readWordAfterType.subscribe(self.logReadWordAfterType);
			self.readSentanceAfterTypeSubscription = self.loggerModdel.readSentanceAfterType.subscribe(self.logReadSentanceAfterType);					
			self.letterSoundAndLetterNameTypingSubscription = self.loggerModdel.letterSoundAndLetterNameTyping.subscribe(self.logLetterSoundAndLetterNameTyping);
		}
	};

	self.disposeSubscriptions = function () {

		if(self.added_hashtagSubscription){
			self.added_hashtagSubscription.dispose();
			self.added_starSubscription.dispose();
			self.choose_appSubscription.dispose();
			self.voiceSpeedSubscription.dispose();
			self.isPredictionVisibleSubscription.dispose();
			self.showAlternativesSubscription.dispose();
			self.isPredictNextWordSubscription.dispose();
			self.highlightStrategySubscription.dispose();
			self.readingStrategySubscription.dispose();
	 		self.press_playSubscription.dispose();
	 		self.press_termsSubscription.dispose();
	 		self.chosen_wordSubscription.dispose();
	 		self.readWordAfterTypeSubscription.dispose();
	 		self.readSentanceAfterTypeSubscription.dispose();
	 		self.letterSoundAndLetterNameTypingSubscription.dispose();
 	}
 };

 	var TimeoutAdded_hashtag = false;
 	self.logAdded_hashtag = function () {		

 		var delay = 1000;            

 		clearTimeout(TimeoutAdded_hashtag);

 		TimeoutAdded_hashtag = setTimeout(function () {

 			var sendData = {           
 				log_fields: {
 					event: logEvents.added_hashtag,
 					added_hashtag: true
 				}
 			};

 			self.prepareData(sendData);

 			self.getResponseAsync({
 				type: "POST",
 				data: JSON.stringify(sendData),
 				url: loggerUrl,
 				callback: function (jsonData) {

 				}
 			});

 		}, delay);
 	};

 	var TimeoutAdded_star = false;
 	self.logAdded_star = function () {		

 		var delay = 1000;            

 		clearTimeout(TimeoutAdded_star);

 		TimeoutAdded_star = setTimeout(function () {

 			var sendData = {           
 				log_fields: {
 					event: logEvents.added_star,
 					added_star: true
 				}
 			};

 			self.prepareData(sendData);

 			self.getResponseAsync({
 				type: "POST",
 				data: JSON.stringify(sendData),
 				url: loggerUrl,
 				callback: function (jsonData) {

 				}
 			});

 		}, delay);
 	};

 	var TimeoutChoose_app = false;
 	self.logChoose_app = function () {		

 		var delay = 250;            

 		clearTimeout(TimeoutChoose_app);

 		TimeoutChoose_app = setTimeout(function () {

 			var sendData = {           
 				log_fields: {
 					event: logEvents.choose_app,
 					app: self.loggerModdel.choose_app()
 				}
 			};

 			self.prepareData(sendData);

 			self.getResponseAsync({
 				type: "POST",
 				data: JSON.stringify(sendData),
 				url: loggerUrl,
 				callback: function (jsonData) {

 				}
 			});

 		}, delay);
 	};

 	var TimeoutIsPredictionVisible = false;
 	self.logIsPredictionVisible = function () {		

 		var delay = 1000;            

 		clearTimeout(TimeoutIsPredictionVisible);

 		TimeoutIsPredictionVisible = setTimeout(function () {

 			if(self.loggerModdel.isPredictionVisible() == self.loggerModdel.etalonObject.isPredictionVisible)
 			{
 				return;
 			}

 			var sendData = {           
 				log_fields: {
 					event: logEvents.change_settings,
 					active_profile: self.loggerModdel.active_profile().voice_id,
 					setting_name: settingNames.isPredictionVisible,
 					from: self.loggerModdel.etalonObject.isPredictionVisible,
 					to: self.loggerModdel.isPredictionVisible()
 				}
 			};

 			self.prepareData(sendData);

 			self.loggerModdel.etalonObject.isPredictionVisible = self.loggerModdel.isPredictionVisible();
 			self.getResponseAsync({
 				type: "POST",
 				data: JSON.stringify(sendData),
 				url: loggerUrl,
 				callback: function (jsonData) {
					
 				}
 			});

 		}, delay);
 	};

 	var TimeoutShowAlternatives = false;
 	self.logShowAlternatives = function () {		

 		var delay = 1000;            

 		clearTimeout(TimeoutShowAlternatives);

 		TimeoutShowAlternatives = setTimeout(function () {

 			if(self.loggerModdel.showAlternatives() == self.loggerModdel.etalonObject.showAlternatives)
 			{
 				return;
 			}

 			var sendData = {           
 				log_fields: {
 					event: logEvents.change_settings,
 					active_profile: self.loggerModdel.active_profile().voice_id,
 					setting_name: settingNames.showAlternatives,
 					from: self.loggerModdel.etalonObject.showAlternatives,
 					to: self.loggerModdel.showAlternatives()
 				}
 			};

 			self.prepareData(sendData);

			self.loggerModdel.etalonObject.showAlternatives = self.loggerModdel.showAlternatives();
 			self.getResponseAsync({
 				type: "POST",
 				data: JSON.stringify(sendData),
 				url: loggerUrl,
 				callback: function (jsonData) {

 				}
 			});

 		}, delay);
 	};

 	var TimeoutIsPredictNextWord = false;
 	self.logIsPredictNextWord = function () {		

 		var delay = 1000;            

 		clearTimeout(TimeoutIsPredictNextWord);

 		TimeoutIsPredictNextWord = setTimeout(function () {

 			if(self.loggerModdel.isPredictNextWord() == self.loggerModdel.etalonObject.isPredictNextWord)
 			{
 				return;
 			}

 			var sendData = {           
 				log_fields: {
 					event: logEvents.change_settings,
 					active_profile: self.loggerModdel.active_profile().voice_id,
 					setting_name: settingNames.isPredictNextWord,
 					from: self.loggerModdel.etalonObject.isPredictNextWord,
 					to: self.loggerModdel.isPredictNextWord()
 				}
 			};

 			self.prepareData(sendData);

			self.loggerModdel.etalonObject.isPredictNextWord = self.loggerModdel.isPredictNextWord();		
 			self.getResponseAsync({
 				type: "POST",
 				data: JSON.stringify(sendData),
 				url: loggerUrl,
 				callback: function (jsonData) {

 				}
 			});

 		}, delay);
 	};

 	var TimeoutHighlightStrategy = false;
 	self.logHighlightStrategy = function () {		

 		var delay = 1000;            

 		clearTimeout(TimeoutHighlightStrategy);

 		TimeoutHighlightStrategy = setTimeout(function () {

 			if(self.loggerModdel.highlightStrategy() == self.loggerModdel.etalonObject.highlightStrategy)
 			{
 				return;
 			}

 			var sendData = {           
 				log_fields: {
 					event: logEvents.change_settings,
 					active_profile: self.loggerModdel.active_profile().voice_id,
 					setting_name: settingNames.highlightStrategy,
 					from: self.loggerModdel.etalonObject.highlightStrategy,
 					to: self.loggerModdel.highlightStrategy()
 				}
 			};

 			self.prepareData(sendData);

			self.loggerModdel.etalonObject.highlightStrategy = self.loggerModdel.highlightStrategy();
 			self.getResponseAsync({
 				type: "POST",
 				data: JSON.stringify(sendData),
 				url: loggerUrl,
 				callback: function (jsonData) {
 				
 				}
 			});

 		}, delay);
 	};

 	var TimeoutReadingStrategy = false;
 	self.logReadingStrategy = function () {		

 		var delay = 1000;            

 		clearTimeout(TimeoutReadingStrategy);

 		TimeoutReadingStrategy = setTimeout(function () {

 			if(self.loggerModdel.readingStrategy() == self.loggerModdel.etalonObject.readingStrategy)
 			{
 				return;
 			}

 			var sendData = {           
 				log_fields: {
 					event: logEvents.change_settings,
 					active_profile: self.loggerModdel.active_profile().voice_id,
 					setting_name: settingNames.readingStrategy,
 					from: self.loggerModdel.etalonObject.readingStrategy,
 					to: self.loggerModdel.readingStrategy()
 				}
 			};

 			self.prepareData(sendData);

 			self.loggerModdel.etalonObject.readingStrategy = self.loggerModdel.readingStrategy();
 			self.getResponseAsync({
 				type: "POST",
 				data: JSON.stringify(sendData),
 				url: loggerUrl,
 				callback: function (jsonData) {
	
 				}
 			});

 		}, delay);
 	};

 	var TimeoutReadWordAfterType = false;
 	self.logReadWordAfterType = function () {		

 		var delay = 1000;            

 		clearTimeout(TimeoutReadWordAfterType);

 		TimeoutReadWordAfterType = setTimeout(function () {

 			if(self.loggerModdel.readWordAfterType() == self.loggerModdel.etalonObject.readWordAfterType)
 			{
 				return;
 			}

 			var sendData = {           
 				log_fields: {
 					event: logEvents.change_settings,
 					active_profile: self.loggerModdel.active_profile().voice_id,
 					setting_name: settingNames.readWordAfterType,
 					from: self.loggerModdel.etalonObject.readWordAfterType,
 					to: self.loggerModdel.readWordAfterType()
 				}
 			};

 			self.prepareData(sendData);

 			self.loggerModdel.etalonObject.readWordAfterType = self.loggerModdel.readWordAfterType();
 			self.getResponseAsync({
 				type: "POST",
 				data: JSON.stringify(sendData),
 				url: loggerUrl,
 				callback: function (jsonData) {
 					
 				}
 			});

 		}, delay);
 	};

 	var TimeoutReadSentanceAfterType = false;
 	self.logReadSentanceAfterType = function () {		

 		var delay = 1000;            

 		clearTimeout(TimeoutReadSentanceAfterType);

 		TimeoutReadSentanceAfterType = setTimeout(function () {

 			if(self.loggerModdel.readSentanceAfterType() == self.loggerModdel.etalonObject.readSentanceAfterType)
 			{
 				return;
 			}

 			var sendData = {           
 				log_fields: {
 					event: logEvents.change_settings,
 					active_profile: self.loggerModdel.active_profile().voice_id,
 					setting_name: settingNames.readSentanceAfterType,
 					from: self.loggerModdel.etalonObject.readSentanceAfterType,
 					to: self.loggerModdel.readSentanceAfterType()
 				}
 			};

 			self.prepareData(sendData);

 			self.loggerModdel.etalonObject.readSentanceAfterType = self.loggerModdel.readSentanceAfterType();
 			self.getResponseAsync({
 				type: "POST",
 				data: JSON.stringify(sendData),
 				url: loggerUrl,
 				callback: function (jsonData) {
 					
 				}
 			});

 		}, delay);
 	};

 	var TimeoutLetterSoundAndLetterNameTyping = false;
 	self.logLetterSoundAndLetterNameTyping = function () {		

 		var delay = 1000;            

 		clearTimeout(TimeoutLetterSoundAndLetterNameTyping);

 		TimeoutLetterSoundAndLetterNameTyping = setTimeout(function () {

 			if(self.loggerModdel.readLetterNameTyping() == self.loggerModdel.etalonObject.readLetterNameTyping
 				&& self.loggerModdel.readLetterSoundTyping() == self.loggerModdel.etalonObject.readLetterSoundTyping)
 			{
 				return;
 			}

 			var sendData = {           

 				log_fields: [{
 					event: logEvents.change_settings,
 					active_profile: self.loggerModdel.active_profile().voice_id,
 					setting_name: settingNames.readLetterNameTyping,
 					from: self.loggerModdel.etalonObject.readLetterNameTyping,
 					to: self.loggerModdel.readLetterNameTyping()
 				},
 				{
 					event: logEvents.change_settings,
 					active_profile: self.loggerModdel.active_profile().voice_id,
 					setting_name: settingNames.readLetterSoundTyping,
 					from: self.loggerModdel.etalonObject.readLetterSoundTyping,
 					to: self.loggerModdel.readLetterSoundTyping()
 				}
 				]
 			};

 			self.prepareData(sendData);

			self.loggerModdel.etalonObject.readLetterNameTyping = self.loggerModdel.readLetterNameTyping();
			self.loggerModdel.etalonObject.readLetterSoundTyping = self.loggerModdel.readLetterSoundTyping();
 			self.getResponseAsync({
 				type: "POST",
 				data: JSON.stringify(sendData),
 				url: loggerUrl,
 				callback: function (jsonData) {

 				}
 			});

 		}, delay);
 	};

 	var TimeoutVoiceSpeed = false;
 	self.logVoiceSpeed = function () {		

 		var delay = 1000;            

 		clearTimeout(TimeoutVoiceSpeed);

 		TimeoutVoiceSpeed = setTimeout(function () {      

 			if(self.loggerModdel.voiceSpeed() == self.loggerModdel.etalonObject.voiceSpeed)
 			{
 				return;
 			}

 			var sendData = {           
 				log_fields: {
 					event: logEvents.change_settings,
 					active_profile: self.loggerModdel.active_profile().voice_id,
 					setting_name: settingNames.voiceSpeed,
 					from: self.loggerModdel.etalonObject.voiceSpeed,
 					to: self.loggerModdel.voiceSpeed()
 				}
 			};

 			self.prepareData(sendData);

 			self.loggerModdel.etalonObject.voiceSpeed = self.loggerModdel.voiceSpeed();
 			self.getResponseAsync({
 				type: "POST",
 				data: JSON.stringify(sendData),
 				url: loggerUrl,
 				callback: function (jsonData) {
 					
 				}
 			});

 		}, delay);
 	};

 	var TimeoutProfile_settings = false;
 	self.logProfile_settings = function () {		

 		var delay = 1000;            

 		clearTimeout(TimeoutProfile_settings);               

 		TimeoutProfile_settings = setTimeout(function () {   

 			if(!self.loggerModdel.ProfileEtalon.active_profile){
 				var voice_id = "firstLogin";
 			} else {
 				voice_id = self.loggerModdel.ProfileEtalon.active_profile.voice_id;

 				if (self.loggerModdel.active_profile().voice_id == voice_id)
 				{
 					return;
 				} 
 			}	             	

 			var sendData = {           
 				log_fields: {
 					event: logEvents.change_profile,
 					from: voice_id,
 					to: self.loggerModdel.active_profile().voice_id,
 					profile_settings: self.loggerModdel.profile_settings()
 				}			
 			};

 			self.prepareData(sendData);

			self.loggerModdel.updateProfileEtalon();
 			self.getResponseAsync({
 				type: "POST",
 				data: JSON.stringify(sendData),
 				url: loggerUrl,
 				callback: function (jsonData) {

 				}
 			});

 		}, delay);
 	};

 	var TimeoutPressPlay = false;
 	self.logPressPlay = function () {		

 		var delay = 1000;            

 		clearTimeout(TimeoutPressPlay);

 		TimeoutPressPlay = setTimeout(function () {

 			var sendData = {           
 				log_fields: {
 					event: logEvents.press_play
 				}
 			};

 			self.prepareData(sendData);

 			self.getResponseAsync({
 				type: "POST",
 				data: JSON.stringify(sendData),
 				url: loggerUrl,
 				callback: function (jsonData) {

 				}
 			});

 		}, delay);
 	};

 	var TimeoutPressTerms = false;
 	self.logPressTerms = function () {		

 		var delay = 1000;            

 		clearTimeout(TimeoutPressTerms);

 		TimeoutPressTerms = setTimeout(function () {


 			var sendData = {           
 				log_fields: {
 					event: logEvents.press_terms
 				}
 			};

 			self.prepareData(sendData);

 			self.getResponseAsync({
 				type: "POST",
 				data: JSON.stringify(sendData),
 				url: loggerUrl,
 				callback: function (jsonData) {

 				}
 			});

 		}, delay);
 	};

var TimeoutChosenWord = false;
 	self.logChosen_word = function () {		

 		var delay = 100;            

 		clearTimeout(TimeoutChosenWord);

 		TimeoutChosenWord = setTimeout(function () {


 			var sendData = {           
 				log_fields: {

 					event: logEvents.choose_word,
 					written_text: self.loggerModdel.textToSend(),
 					chosen_word: self.loggerModdel.chosen_word().word,
 					selection_method: self.loggerModdel.chosen_word().selection_method
 					? selectionMethod.mouse_click 
 					: selectionMethod.keyboard_shortcut 
 				}
 			};

 			self.prepareData(sendData);

 			self.getResponseAsync({
 				type: "POST",
 				data: JSON.stringify(sendData),
 				url: loggerUrl,
 				callback: function (jsonData) {

 				}
 			});

 		}, delay);
 	};		
};
