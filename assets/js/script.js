var tasks = {};

// create task as <li> element with child <span> and <p> elements, appends to <ul>
// created tasks as <p> are later replaced by <textarea> during task descr update
var createTask = function (taskText, taskDate, taskList) {
	// create elements that make up a task item
	var taskLi = $("<li>").addClass("list-group-item");
	var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(taskDate);
	var taskP = $("<p>").addClass("m-1").text(taskText);

	// append span and p element to parent li
	taskLi.append(taskSpan, taskP);

	// append to ul list on the page
	$("#list-" + taskList).append(taskLi);
};

var loadTasks = function () {
	tasks = JSON.parse(localStorage.getItem("tasks"));

	// if nothing in localStorage, create a new object to track all task status arrays
	if (!tasks) {
		tasks = {
			toDo: [],
			inProgress: [],
			inReview: [],
			done: [],
		};
	}

	// loop over object properties
	$.each(tasks, function (list, arr) {
		// then loop over sub-array
		arr.forEach(function (task) {
			createTask(task.text, task.date, list);
		});
	});
};

var saveTasks = function () {
	localStorage.setItem("tasks", JSON.stringify(tasks));
};

// event delegation listener from <p> elements to parent <ul class="list-group>
// this event manages click tgo update task description

$(".list-group").on("click", "p", function () {
	// "this" would be equivalent to event.target
	// gets task description into var text
	var text = $(this).text().trim();

	// creates <textarea> element, adds class name, and value
	var textInput = $("<textarea>").addClass("form-control").val(text);

	// Swap old text description with updated description; <textarea> element is MORE
	// suitable to accept user input data, it can accept any combination and length of
	// plain text letters, numbers, and symbol; you can also control length, put a
	// placegholder, requirted, wrap, etc.
	$(this).replaceWith(textInput);

	// programatically "triggers" the event "focus" on textInput to avoid the need
	// to click on <textarea> to start the text descr update
	textInput.trigger("focus");
});

// due date was clicked
// event delegation listener from <span> elements to parent <ul class="list-group>
// this event manages click tgo update task description
$(".list-group").on("click", "span", function () {
	// "this" would be equivalent to event.target
	// gets currentdate  as text  into var text
	var date = $(this).text().trim();

	// creates <input> element, adds class name, and value
	var dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);

	// Swap old date with updated date (text firmat)
	$(this).replaceWith(dateInput);

	// enable jquery ui datepicker
	dateInput.datepicker({
		minDate: 1,
		onClose: function () {
			// when datepicker is closed-off, "force" a change event on the dateInput to
			// ensure that we replace back from the <input> to <span> element
			$(this).trigger("change");
		}
	});

	// programatically "triggers" the event "focus" on dateInput to avoid the need
	// to click on <input> to start the date update
	dateInput.trigger("focus");
});

// this blur event will trigger as soon as the focus get outside the <input> elem
// we capture updated info and parent's element id, and the elemnt's position (<li>)n
// on the list to update the correct task in the tasks object AND  gets back from\
// the temporal <input> element back to the original <span> element

// we change the "blur" event by a "change" event after adding the datepicker
// the blur worked to let the browser know we were done editing a due date, because
// we wrote the date directly into the < input > element. Now, however, we use the date
// picker to populate that element.
// This sounds more like a change event than a blur event, so we just need to listen
// for a change instead.
// NOTE that because we are replacing blur by change, the <input> field wont
// automatically return to a < span > element unless we force this listener to run after
// using AND calosing off the datepicker
// change from "blur"
// $(".list-group").on("blur", "input[type='text']", function () {
// to "change"
$(".list-group").on("change", "input[type='text']", function () {
	// get the  current value as text
	var date = $(this).val().trim();

	// get the parent ul's id attribute by transversing-up to the closest ".list-group"
	// Here, we're chaining it to attr(), which is returning the ID, which will be "list-"
	// followed by the category.We're then chaining that to .replace() to remove "list-"
	// from the text, which will give us the category name(e.g., "toDo") that will match one
	// of the arrays on the tasks object(e.g., tasks.toDo).
	var status = $(this).closest(".list-group").attr("id").replace("list-", "");

	// get the task's position (itself in closest) in the list of other li elements (see create task)
	var index = $(this).closest(".list-group-item").index();

	// update task in array and re-save to localstorage
	// tasks is an object.
	// tasks[status] returns an array (e.g., toDo).
	// tasks[status][index] returns the object at the given index in the array.
	// tasks[status][index].date returns the date property of the object at the given index.
	tasks[status][index].date = date;

	// persists updated task description
	saveTasks();

	// recreate <span> element with updated date text
	var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);

	// replace input with <span> element
	$(this).replaceWith(taskSpan);
});

// this blur event will trigger as soon as the focus get outside the <textarea> elem
// we capture updated info and parent's element id, and the elemnt's position (<li>)n
// on the list to update the correct task in the tasks object
$(".list-group").on("blur", "textarea", function () {
	// get the textarea's current value/text
	var text = $(this).val().trim();

	// get the parent ul's id attribute by transversing-up to the closest ".list-group"
	// Here, we're chaining it to attr(), which is returning the ID, which will be "list-"
	// followed by the category.We're then chaining that to .replace() to remove "list-"
	// from the text, which will give us the category name(e.g., "toDo") that will match one
	// of the arrays on the tasks object(e.g., tasks.toDo).
	var status = $(this).closest(".list-group").attr("id").replace("list-", "");

	// get the task's position (itself in closest) in the list of other li elements (see create task)
	var index = $(this).closest(".list-group-item").index();

	// tasks is an object.
	// tasks[status] returns an array (e.g., toDo).
	// tasks[status][index] returns the object at the given index in the array.
	// tasks[status][index].text returns the text property of the object at the given index.
	tasks[status][index].text = text;

	// persists updated task description
	saveTasks();

	// recreate <p> element with updated text
	var taskP = $("<p>").addClass("m-1").text(text);

	// replace textarea with <p> element
	$(this).replaceWith(taskP);
});

// add drag&drop capabilities using JQuery UI widget "sortable"
// connectWith is itself and the other cards with the list-group class
$(".card .list-group").sortable({
	connectWith: $(".card .list-group"),
	scroll: false,
	tolerance: "pointer",
	helper: "clone",
	activate: function (event) {
		// console.log("activate", this);
	},
	deactivate: function (event) {
		// console.log("deactivate", this);
	},
	over: function (event) {
		// console.log("over", event.target);
	},
	out: function (event) {
		// console.log("out", event.target);
	},
	// The children() method returns an array of the list element's
	// children(the <li> elements, labeled as li.list - group - item).
	// No coincidence, tasks are saved in localStorage as an array.The
	// order of these<li> elements and the indexes in the task arrays
	// should match one - to - one.This means we just need to loop over
	// the elements, pushing their text values into a new tasks array.
	update: function (event) {
		var tempArr = [];
		// loop over current set of children in sortable list
		$(this)
			.children()
			.each(function () {
				var text = $(this).find("p").text().trim();
				var date = $(this).find("span").text().trim();
				tempArr.push({
					text: text,
					date: date,
				});
			});

		// trim down list's ID starting string to find object property
		// "toDo" - from "list-toDo", etc.
		var arrName = $(this).attr("id").replace("list-", "");

		// update array on task object and save
		tasks[arrName] = tempArr;
		saveTasks();
	},
});

// converts trash element to droppable element.
// NOTE that Removing a task from any of the lists triggers a sortable update(),
// meaning the sortable calls saveTasks().
$("#trash").droppable({
	accept: ".card .list-group-item",
	tolerance: "touch",
	drop: function (event, ui) {
		// THE ACTUAL DRAG AND DROP
		ui.draggable.remove();
		// console.log("drop");
	},
	over: function () {
		// console.log("over");
	},
	out: function () {
		// console.log("out");
	},
});

// adds JQ UI datepicker to modal, just one line of code to add the datapicker
// additional attributes are needed tho
$("#modalDueDate").datepicker({
	minDate: 1,
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
	// clear values
	$("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
	// highlight textarea
	$("#modalTaskDescription").trigger("focus");
});

// save button (.btn-primary) in modal (#task-form-modal) was clicked
$("#task-form-modal .btn-primary").click(function () {
	// get form values
	var taskText = $("#modalTaskDescription").val();
	var taskDate = $("#modalDueDate").val();

	if (taskText && taskDate) {
		createTask(taskText, taskDate, "toDo");

		// close modal (add/update task)
		$("#task-form-modal").modal("hide");

		// save in tasks array
		tasks.toDo.push({
			text: taskText,
			date: taskDate,
		});

		saveTasks();
	}
});

// remove all tasks
$("#remove-tasks").on("click", function () {
	for (var key in tasks) {
		tasks[key].length = 0;
		$("#list-" + key).empty();
	}
	saveTasks();
});

// load tasks for the first time
loadTasks();
