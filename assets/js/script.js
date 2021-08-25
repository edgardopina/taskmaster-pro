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
  var taskP = $(",p>").addClass("m-1").text(text);
  
  // replace textarea with <p> element
  $(this).replaceWith(taskP);
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
