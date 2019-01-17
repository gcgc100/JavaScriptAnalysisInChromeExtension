function LoggerModel() {

	var self = this;

	self.log_fields = ko.observable();
	self.session_id = ko.observable();
	self.version = ko.observable(1);
	self.username = ko.observable();
	self.domain = ko.observable();
	self.application_name = ko.observable();
	self.added_hashtag = ko.observable();
	self.added_star = ko.observable();
	self.voiceSpeed = ko.observable();
	self.isPredictionVisible = ko.observable();
	self.showAlternatives = ko.observable();
	self.highlightStrategy = ko.observable();
	self.readingStrategy = ko.observable(1);
	self.isPredictNextWord = ko.observable();
	self.active_profile = ko.observable();
	self.profile_settings = ko.observable();
	self.choose_app = ko.observable();
	self.press_play = ko.observable();
	self.press_terms = ko.observable();
	self.textToSend = ko.observable();
	self.chosen_word = ko.observable();
	self.readWordAfterType = ko.observable();
	self.readSentanceAfterType = ko.observable();
	self.readLetterNameTyping = ko.observable();
	self.readLetterSoundTyping = ko.observable();
	self.letterSoundAndLetterNameTyping = ko.observable();

	self.ignoreList = {
		"ignore": ["etalon", "etalonObject", "active_profile", "profile_settings"]
	};

	self.ProfileEtalon = {};

	self.updateEtalon = function () {

		delete self.etalon;
		self.etalon = ko.mapping.toJSON(self, self.ignoreList);
		self.etalonObject = $.parseJSON(self.etalon);
	};

	self.updateProfileEtalon = function () {

		self.ProfileEtalon.active_profile = self.active_profile();
		self.ProfileEtalon.profile_settings = self.profile_settings();
	};


};