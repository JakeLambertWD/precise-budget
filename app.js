// BUDGET CONTROLLER
var budgetController = (function () {
	// FUNCTIONAL CONSTRUCTORS
	var Expense = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function (totalIncome) {
		if (this.value > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function () {
		return this.percentage;
	};

	var Income = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	// CALCULATER for EXP & INC
	var calculateTotal = function (type) {
		var sum = 0;
		data.allItems[type].forEach(function (curr) {
			sum += curr.value;
		});
		// add to data structure
		data.totals[type] = sum;
	};

	// DATA STRUCTURE
	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	return {
		// ADD ITEM
		addItem: function (type, des, val) {
			var newItem, ID;

			// set ID
			if (data.allItems[type].length > 0) {
				// get the id of the last array element + 1 for new ID
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				// default ID
				ID = 0;
			}

			// create new item
			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, des, val);
			}

			// push into our data structure
			data.allItems[type].push(newItem);

			// Return the new element
			return newItem;
		},

		deleteItem: function (type, id) {
			var ids, index;

			// The map() method creates a new array with the results of calling a function for every array element.
			var ids = data.allItems[type].map(function (current) {
				return current.id;
			});
			// get index of id
			index = ids.indexOf(id);

			// remove 1 element from array
			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},

		calculateBudget: function () {
			// Calculate total income & expenses
			calculateTotal('exp');
			calculateTotal('inc');

			// Calculate the budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;

			// Calculate the percentage of income that we spend
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				// otherwise the percentage will break
				data.percentage = -1;
			}
		},

		calculatePercentages: function () {
			data.allItems.exp.forEach(function (cur) {
				cur.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function () {
			var allPerc = data.allItems.exp.map(function (cur) {
				return cur.getPercentage();
			});
			return allPerc;
		},

		getBudget: function () {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		}
	};
})();

// UI CONTROLLER
var UIController = (function () {
	// DOM CLASSES
	var DOMstrings = {
		inputType: '.add__type',
		inputDesc: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var formatNumber = function (num, type) {
		// converts to positive number
		num = Math.abs(num);
		// fixes to 2 decimal places
		num = num.toFixed(2);

		// split number into a array of strings at the decimal point
		numSplit = num.split('.');

		int = numSplit[0];
		if (int.length > 3) {
			// input 23100 output 23,100
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
		}

		dec = numSplit[1];

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
	};

	return {
		// GET USER INPUTS AS OBJECT
		getInput: function () {
			return {
				type: document.querySelector(DOMstrings.inputType).value, // either inc or exp
				description: document.querySelector(DOMstrings.inputDesc).value, // PS5
				// parseFloat() returns a floating point number
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		// ADD ITEM TO THE UI
		addListItem: function (obj, type) {
			var html, newHtml, element;

			// get classname for inc or exp section
			if (type === 'inc') {
				element = DOMstrings.incomeContainer;
				// html template w/ placeholders
				html =
					'<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'exp') {
				element = DOMstrings.expenseContainer;
				// html template
				html =
					'<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			// Replace the placeholder text with some actual data
			// the html variable is a string, replace is a method of a string
			// the replace method searches for a string then replaces it with the data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			// Insert the HTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		// DELETE LIST ITEM IN THE UI
		deleteListItem: function (selectorID) {
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		// CLEAR FIELDS
		clearFields: function () {
			var fields, fieldsArr;
			// get input fields
			// The querySelectorAll() method returns all elements in the document that matches a specified CSS selector(s), as a static NodeList object.
			fields = document.querySelectorAll(
				DOMstrings.inputDesc + ', ' + DOMstrings.inputValue
			);

			// converts static list into an array
			// slice() returns a copy of an array
			fieldsArr = Array.prototype.slice.call(fields);

			// loop through array to clear
			fieldsArr.forEach(function (current, index, array) {
				current.value = '';
			});

			// focus user to first input field
			fieldsArr[0].focus();
		},

		// UPDATE BUDGETS IN THE UI
		displayBudget: function (obj) {
			var type;
			obj.budget > 0 ? (type = 'inc') : (type = 'exp');

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
				obj.budget,
				type
			);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
				obj.totalInc,
				'inc'
			);
			document.querySelector(
				DOMstrings.expenseLabel
			).textContent = formatNumber(obj.totalExp, 'exp');

			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent =
					obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},

		displayPercentages: function (percentages) {
			// select all the expenses percentage elements
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

			// READ PROPERLY
			var nodeListForEach = function (list, callback) {
				for (var i = 0; i < list.length; i++) {
					callback(list[i], i);
				}
			};

			nodeListForEach(fields, function (current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
			});
		},

		displayMonth: function () {
			var now = new Date();
			var months = [
				'jan',
				'feb',
				'mar',
				'apr',
				'may',
				'jun',
				'jul',
				'aug',
				'sep',
				'oct',
				'nov',
				'dec'
			];
			var month = now.getMonth();

			var year = now.getFullYear();
			document.querySelector(DOMstrings.dateLabel).textContent =
				months[month] + ' ' + year;
		},

		// RETURN DOM CLASSES
		getDOMstrings: function () {
			return DOMstrings;
		}
	};
})();

// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
	// PARAMETERS

	// EVENT LISTENERS
	var setupEventListeners = function () {
		// get DOM element classes
		var DOM = UICtrl.getDOMstrings();

		// button click
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		// key press
		document.addEventListener('keypress', function (event) {
			// 13 represents the enter button
			if (event.keyCode === 13 || event.which === 13) {
				// keyCode & which are properties used by different browsers
				ctrlAddItem();
			}
		});

		// delete button click
		document
			.querySelector(DOM.container)
			.addEventListener('click', ctrlDeleteItem);
	};

	// UPDATE BUDGET
	var updateBudget = function () {
		// 1. Calculate the budget
		budgetCtrl.calculateBudget();

		// 2. Return the budget
		var budget = budgetCtrl.getBudget();

		// 3. Display the budget on the UI
		UICtrl.displayBudget(budget);
	};

	var updatePercentages = function () {
		// 1. Calculate percentages
		budgetCtrl.calculatePercentages();

		// 2. Read them from the budget controller
		var percentages = budgetCtrl.getPercentages();

		// 3. Update the UI w/ new percentages
		UICtrl.displayPercentages(percentages);
	};

	// ADD NEW ITEM
	var ctrlAddItem = function () {
		var input, newItem;
		// 1. Get user inputs
		input = UICtrl.getInput();

		// Check if fields are empty
		// isNaN() determines whether a value is NaN or not
		if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
			// 2. Add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			// 3. Add the item to the UI
			UICtrl.addListItem(newItem, input.type);

			// 4. Clear fields
			UICtrl.clearFields();

			// 5. Calculate & update budget
			updateBudget();

			// 6. Calculate & update percentages
			updatePercentages();
		}
	};

	// DELETE ITEM
	var ctrlDeleteItem = function (event) {
		var itemID, splitID, type, ID;
		// Event delegation will listen for events on multiple element
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemID) {
			// inc-1
			splitID = itemID.split('-');
			// ["inc", "1"]
			type = splitID[0];
			// convert string to integer
			ID = parseInt(splitID[1]);

			// 1. Delete the item from the data structure
			budgetCtrl.deleteItem(type, ID);

			// 2. Delete the item from the UI
			UICtrl.deleteListItem(itemID);

			// 3. Update and show the new budget
			updateBudget();

			// 4. Calculate & update percentages
			updatePercentages();
		}
	};

	// RETURN EVENT LISTENERS
	return {
		init: function () {
			setupEventListeners();
			UICtrl.displayMonth();
		}
	};

	// ARGUMENTS
})(budgetController, UIController);

// CALL INIT
controller.init();
