(function($) {

	// Форма
	var Form = function (el) {
		var $this = el,
			that = this,
			$submit = $("[type=submit], .js-submit", $this);

		this.fields = {};

		var init = function () {
			initFields();
			initSelectDateGroup();
			bindEvents();
			that.validate();
		};

		this.addField = function (name, field) {
			if (field) {
				that.fields[name] = field;
			}
		};

		var initFields = function () {
			var $fields = $("input, select", $this).not("[type=submit]").not("[type=radio]").not("[data-type=selectDateGroup]");

			$fields.each(function () {
				var $this = $(this),
					name = $this.attr("name"),
					field = Field.create($this);

				that.addField(name, field);
			});
		};

		var initSelectDateGroup = function() {
			var $selectDateGroups = $("[data-type=selectDateGroup]"),
				groups = {};

			$selectDateGroups.each(function () {
				var $this = $(this),
					groupName = $this.data("selectdategroup");

				if (!groups[groupName]) {
					groups[groupName] = true;
				}
			});

			for (var name in groups) {
				var $el = $selectDateGroups.filter("[data-selectdategroup=" + name + "]"),
				field = Field.create($el, "selectDateGroup");

				that.addField(name, field);
			};

		};

		var bindEvents = function () {
			for (var name in that.fields) {
				that.fields[name].events.on("change:field", that.validate);
			}
		};

		this.validate = function () {
			var isValid = true;

			for (var name in that.fields) {
				var field = that.fields[name];

				if (field.isErrorStatus()) {
					isValid = false;
				}
			}

			if (isValid) {
				that.enableSubmit();
				return true;
			}
			else {
				that.disabledSubmit();
				return false;
			}
		};

		this.enableSubmit = function () {
			$submit.data({disabled: false}).removeClass('disabled').removeAttr('disabled');
		};

		this.disabledSubmit = function () {
			$submit.data({disabled: true}).addClass('disabled').attr('disabled', 'disabled');
		};

		init();
	};



	var Field = function (el) {
		var $this = el,
			that = this,
			name = $this.attr("name"),
			ERROR_STATUS = false;

		this.val = $this.val();
		this.events = $this;


		this.setErrorStatus = function () {
			ERROR_STATUS = true;
		};

		this.unsetErrorStatus = function () {
			ERROR_STATUS = false;
		};

		this.setErrorState = function () {
			$this.addClass("error");
			$this.trigger("error");
		};

		this.unsetErrorState = function () {
			that.unsetErrorStatus();
			$this.removeClass("error");
		};

		this.isErrorStatus = function () {
			if (ERROR_STATUS) {
				return true;
			}
			else {
				return false;
			}
		};

		this.completed = function () {
			$this.data("completed", true);
		};

		this.uncompleted = function () {
			$this.data("completed", false);
		};

		this.isCompleted = function () {
			return $this.data("completed");
		};

		this.setValue = function (val) {
			$this.val(val).trigger("fly:change");
		};

		this.getValue = function () {
			return $this.val();
		};

		this.isRequired = function () {
			if ($this.data("required") || $this.hasClass("js-required")) {
				if (that.isVisible()) {
					return true;
				}
				else {
					return false;
				}
			}
			else {
				return false;
			}
		};

		this.isEmpty = function () {
			var val = $this.val(),
				defaultVal = $this.data("empty") || "",
				placeholder = $this.data("placeholder") || $this.attr("placeholder") || "",
				emptyExp = /^ *$/;

			if (emptyExp.test(val) || val === defaultVal || val === placeholder) {
				return true;
			}
			else {
				return false;
			}
		};

		this.isVisible = function () {
			if ($this.is(":visible")) {
				return true;
			}
			else {
				return false;
			}
		};

		this.validate   = function() {};
		this.bindEvents = function () {};
		this.isValid    = function () {};
		this.setMask    = function () {};
	};



	Field.create = function (el, type) {
		var $this = el,
			type = type || $this.data("type"),
			field;

		if ($this.attr("type") === "checkbox") {
			type = "checkbox";
		}
		else if (type === undefined) {
			type = "all";
		}

		if (typeof(Field[type]) !== "function") return false;

		Field[type].prototype = new Field($this);

		field = new Field[type]($this);
		return field;
	};


	Field.email = function (el) {
		var $this = el,
			that = this,
			showError = false;

		var init = function () {
			that.bindEvents();
			that.validate();
		};

		this.bindEvents = function () {
			$this.on("keyup keypress input cut copy paste change click fly:change", onChangeHandler);
			$this.on("blur", onBlurHandler);
		};

		var onBlurHandler = function () {
			if (that.isEmpty()) return false;

			if (that.isErrorStatus()) {
				that.setErrorState();
				showError = true;
			}
		};

		var onChangeHandler = function () {
			that.unsetErrorState();
			that.validate();
			

			$this.trigger("change:field");
		};

		this.validate = function () {
			if (that.isRequired() && !that.isEmail()) {
				that.setErrorStatus();
				return false;
			}
			else if (that.isEmpty() || that.isEmail()) {
				that.unsetErrorStatus();
				return true;
			}
		};

		this.isEmail = function () {
			var val = $this.val(),
				emailExp = /^[A-Za-z0-9\._%-]+@[A-Za-z0-9а-яёА-ЯЁ.-]+\.[A-Za-zрфРФ]{2,6}/;

			if (emailExp.test(val)) {
				return true;
			}
			else {
				return false;
			}
		};

		init();
	};

	Field.phone = function (el) {
		var $this = el,
			that = this,
			showError = false;

		var init = function () {
			that.setMask();
			that.bindEvents();
			that.validate();
		};

		this.bindEvents = function () {
			$this.on("keyup keypress input cut copy paste change click fly:change", onChangeHandler);
			$this.on("blur", onBlurHandler);
		};

		var onBlurHandler = function () {			
			if (that.isEmpty()) return false;

			if (that.isErrorStatus()) {
				that.setErrorState();
				showError = true;
			}
		};

		var onChangeHandler = function () {
			that.unsetErrorState();			
			that.validate();

			$this.trigger("change:field");
		};

		this.validate = function () {
			if (that.isRequired() && !that.isPhone()) {
				that.setErrorStatus();
				return false;
			}
			else if (that.isEmpty() || that.isPhone()) {
				that.unsetErrorStatus();
				return true;
			}
		};

		this.isPhone = function () {
			var val = $this.val(),
				phoneExp = /\+*[78] \(*\d{3}\)* \d{3}\-\d{2}\-\d{2}/;
				
			if (phoneExp.test(val)) {
				return true;
			}
			else {
				return false;
			}
		};

		this.setMask = function () {
			var rule = $this.data("mask") || "+7 999 999-99-99",
				placeholder = $this.attr("data-placeholder") || "_";

			$this.mask(rule, {clearInvalid: false, placeholder: placeholder});
		};

		init();
	};

	Field.latin = function (el) {
		var $this = el,
			that = this;

		var init = function () {
			that.setMask();
			that.bindEvents();
			that.validate();
		};

		this.bindEvents = function () {
			$this.on("keyup keypress input cut copy paste change click fly:change", onChangeHandler);
		};

		var onChangeHandler = function () {
			that.validate();
			$this.trigger("change:field");
		};

		this.validate = function () {
			if (that.isRequired()) {
				if (that.isEmpty()) {
					that.setErrorStatus();
					return false;
				}
			}

			that.unsetErrorStatus();
			return true;
		};

		this.setMask = function () {
			var rule = $this.data("mask") || "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
				placeholder = $this.attr("data-placeholder") || "";

			$this.mask(rule, {clearInvalid: false, placeholder: placeholder});
		};

		init();
	};

	Field.cyrillic = function (el) {
		var $this = el,
			that = this;

		var init = function () {
			that.setMask();
			that.bindEvents();
			that.validate();
		};

		this.bindEvents = function () {
			$this.on("keyup keypress input cut copy paste change click fly:change", onChangeHandler);
		};

		var onChangeHandler = function () {
			that.validate();

			$this.trigger("change:field");
		};

		this.setMask = function () {
			var rule = $this.data("mask") || "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
				placeholder = $this.attr("data-placeholder") || "";

			$this.mask(rule, {clearInvalid: false, placeholder: placeholder});
		};

		this.validate = function () {
			if (that.isRequired()) {
				if (that.isEmpty()) {
					that.setErrorStatus();
					return false;
				}
			}

			that.unsetErrorStatus();
			return true;
		};

		init();
	};

	Field.checkbox = function (el) {
		var $this = el,
			that = this;

		var init = function () {
			that.bindEvents();
			that.validate();
		};

		this.bindEvents = function () {
			$this.on("change click", onChangeHandler);
		};

		var onChangeHandler = function () {
			that.validate();

			$this.trigger("change:field");
		};


		this.validate = function () {
			if (that.isRequired()) {
				if (!that.isChecked()) {
					that.setErrorStatus();
					return false;
				}
			}

			that.unsetErrorStatus();
			return true;
		};

		this.isChecked = function () {
			if ($this.is(":checked")) {
				return true;
			}
			else {
				return false;
			}
		};

		init();
	};

	Field.selectDateGroup = function (el) {
		var $this = el,
			that = this,
			$day = $this.filter("[data-role=day]"),
			$month = $this.filter("[data-role=month]"),
			$year = $this.filter("[data-role=year]");

		var init = function () {
			that.bindEvents();
			that.validate();
		};

		this.bindEvents = function () {
			$this.on("change", onChangeHandler);
			$day.on("change", onChangeDay);
			$month.on("change", onChangeMonth);
			$year.on("change", onChangeYear);
		};

		var onChangeHandler = function () {
			updateDaySelect();
			that.validate();
			$this.trigger("change:field");
		};

		var updateDaySelect = function () {
			var month = that.getSelectedMonth(),
				$dayOptions = $("option", $day);

			if (month == 4 || month == 6 || month == 9 || month == 11 || month == 2) {
				hideOption($dayOptions.eq(31));
				if (month == 2) {
					hideOption($dayOptions.eq(30));
					if (that.isLeapYear()) {
						showOption($dayOptions.eq(29));
					}
					else {
						hideOption($dayOptions.eq(29));
					}
				}
			}
			else {
				showOption($dayOptions.eq(31));
				showOption($dayOptions.eq(30));
				showOption($dayOptions.eq(29));
			}


			// Прячем/показываем кроссбраузерно option
			function hideOption(el) {
				var $this = el,
					currentElIndex = $this.index(),
					selectedOptionIndex = $dayOptions.filter(":selected").index();

				if (!$this.parent().is('span.hidden')) {
					$this.wrap("<span class='hidden'></span>").parent().hide();
				}

				if (currentElIndex === selectedOptionIndex) {
					$this.removeAttr('selected');
					$dayOptions.eq(0).attr('selected', 'selected');
				}
			};

			function showOption(el) {
				var $this = el;
				if ($this.parent().is('span.hidden')) {
					$this.unwrap();
				}
			};
		};

		var onChangeDay = function () {
			$this.trigger("change:day");
		};

		var onChangeMonth = function () {
			$this.trigger("change:month");
		};

		var onChangeYear = function () {
			$this.trigger("change:year");
		};

		this.getSelectedDay = function () {
			return $day.val();
		};

		this.getSelectedMonth = function () {
			return $month.val();
		};

		this.getSelectedYear = function () {
			return $year.val();
		};

		this.getSelectedDate = function () {
			if (that.isEmpty()) return false;

			var day = that.getSelectedDay(),
				month = that.getSelectedMonth(),
				year = that.getSelectedYear(),
				date = new Date(year, month - 1, day);

			return date;
		};

		this.isOlder = function (age) {
			var today = new Date(),
				selectedDate = that.getSelectedDate();

			if (new Date(today.getFullYear() - age, today.getMonth(), today.getDate()) > selectedDate) {
				return true;
			}
			else {
				return false;
			}
		};

		this.isYounger = function (age) {
			var today = new Date(),
				selectedDate = that.getSelectedDate();

			if (new Date(today.getFullYear() - age, today.getMonth(), today.getDate()) < selectedDate) {
				return true;
			}
			else {
				return false;
			}
		};

		this.isEqual = function (age) {
			if (!that.isYounger(age) && that.isYounger(age + 1)) {
				return true;
			}
			else {
				return false;
			}
		};

		this.isEmpty = function () {
			var day = that.getSelectedDay(),
				month = that.getSelectedMonth(),
				year = that.getSelectedYear(),
				emptyExp = /^ *$/;

			if (emptyExp.test(day) || emptyExp.test(month) || emptyExp.test(year)) {
				return true;
			}
			else {
				return false;
			}
		};

		this.validate = function () {
			if (that.isRequired()) {
				if (that.isEmpty()) {
					that.setErrorStatus();
					return false;
				}
			}

			that.unsetErrorStatus();
			return true;
		};


		this.isLeapYear = function () {
			var year = that.getSelectedYear();

			if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
				return true;
			}
			else {
				return false;
			}
		};

		init();
	};

	Field.family = function (el) {
		var $this = el,
			that = this;

		var init = function () {
			that.bindEvents();
			that.validate();
		};

		this.bindEvents = function () {
			$this.on("change fly:change", onChangeHandler);
		};

		var onChangeHandler = function () {
			that.validate();

			$this.trigger("change:field");
		};

		this.validate = function () {
			if (that.isRequired()) {
				if (that.isEmpty()) {
					that.setErrorStatus();
					return false;
				}
			}

			that.unsetErrorStatus();
			return true;
		};

		this.setMenOptions = function () {
			var sexMenOptions = ['', 'женат', 'в «гражданском браке»', 'разведён', 'холост', 'вдовец'],
				$options = $("option", $this);

			$options.each(function (index) {
				$(this).text(sexMenOptions[index]);
			});

		};

		this.setWomenOptions = function () {
			var sexWomenOptions = ['', 'замужем', 'в «гражданском браке»', 'разведена', 'не замужем', 'вдова'],
			$options = $("option", $this);

			$options.each(function (index) {
				$(this).text(sexWomenOptions[index]);
			});
		};

		init();
	};


	Field.all = function (el) {
		var $this = el,
			that = this;

		var init = function () {
			that.bindEvents();
			that.validate();
		};

		this.bindEvents = function () {
			$this.on("keyup keypress input cut copy paste change click fly:change", onChangeHandler);
		};

		var onChangeHandler = function () {
			that.validate();

			$this.trigger("change:field");
		};

		this.validate = function () {
			if (that.isRequired()) {
				if (that.isEmpty()) {
					that.setErrorStatus();
					return false;
				}
			}

			that.unsetErrorStatus();
			return true;
		};

		init();
	};

	Field.digital = function (el) {};

	$.fn.flyValidate = function(options) {
		var form;
		this.each(function() {
			form = new Form($(this));
		});
		return form;
  	};

})(jQuery);