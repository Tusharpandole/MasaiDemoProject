// ============================================================
// 1. BACKEND CONNECTION AND HTML ELEMENTS
// ============================================================

// Store the FastAPI backend address in one reusable constant.
const API_BASE_URL = "http://127.0.0.1:8000";

// Select the task form from the HTML page.
const taskForm = document.getElementById("task-form");

// Select the project dropdown.
const projectSelect = document.getElementById("project-select");

// Select the container where task cards will appear.
const taskList = document.getElementById("task-list");

// Select the search input.
const searchInput = document.getElementById("search-input");

// Select the sorting dropdown.
const sortSelect = document.getElementById("sort-select");

// Select the area where success and error messages appear.
const formMessage = document.getElementById("form-message");

// Select the form submit button.
const submitButton = document.getElementById("submit-button");

// Select the Cancel Edit button.
const cancelEditButton = document.getElementById("cancel-edit-button");

// Select the task title input.
const taskTitleInput = document.getElementById("task-title");

// Select the priority dropdown.
const taskPriorityInput = document.getElementById("task-priority");

// Select the status dropdown.
const taskStatusInput = document.getElementById("task-status");

// Select the due date input.
const taskDueDateInput = document.getElementById("task-due-date");

// Store all tasks received from the backend.
let allTasks = [];

// Store all projects received from the backend.
let allProjects = [];

// null means we are creating a new task.
// A task ID means we are editing an existing task.
let editingTaskId = null;


// ============================================================
// 2. REUSABLE API FUNCTION
// ============================================================

// Reuse this function for GET, POST, PUT, and DELETE requests.
async function apiRequest(endpoint, options = {}) {

    // Send an HTTP request to the selected backend endpoint.
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {

        // Use the provided HTTP method; GET is the default.
        method: options.method || "GET",

        // Tell the backend that the request body contains JSON.
        headers: {
            "Content-Type": "application/json"
        },

        // Convert the JavaScript object into JSON if a body exists.
        body: options.body
            ? JSON.stringify(options.body)
            : undefined
    });

    // Convert the backend's JSON response into a JavaScript object.
    const data = await response.json();

    // Check whether the backend returned a successful HTTP status.
    if (!response.ok) {

        // FastAPI validation errors may be an array of objects.
        // Other errors may contain a simple detail message.
        const errorMessage = Array.isArray(data.detail)
            ? data.detail.map(error => error.msg).join(", ")
            : data.detail || "Something went wrong.";

        // Throw the error so the calling function can handle it.
        throw new Error(errorMessage);
    }

    // Return the response data to the function that called apiRequest.
    return data;
}


// ============================================================
// 3. LOAD PROJECTS FROM BACKEND
// ============================================================

async function loadProjects() {

    try {

        // Call GET /projects and store the returned projects.
        allProjects = await apiRequest("/projects");

        // Remove the temporary Loading projects option.
        projectSelect.replaceChildren();

        // Check whether the backend returned any projects.
        if (allProjects.length === 0) {

            // Create an option explaining that no projects exist.
            const option = document.createElement("option");

            option.value = "";
            option.textContent = "No projects available";

            // Add the option to the project dropdown.
            projectSelect.appendChild(option);

            return;
        }

        // Read the previously selected project ID from Local Storage.
        const savedProjectId = localStorage.getItem("selectedProjectId");

        // Check whether the saved project still exists.
        const savedProjectExists = allProjects.some(
            project => String(project.id) === savedProjectId
        );

        // Restore the saved project or select the first available project.
        const selectedProjectId = savedProjectExists
            ? savedProjectId
            : String(allProjects[0].id);

        // Create one dropdown option for every project.
        allProjects.forEach(project => {

            const option = document.createElement("option");

            // Use the project ID as the option value.
            option.value = project.id;

            // Display the project name to the user.
            option.textContent = project.name;

            // Add the option to the dropdown.
            projectSelect.appendChild(option);
        });

        // Select the saved or default project.
        projectSelect.value = selectedProjectId;

        // Remember the selected project in the browser.
        localStorage.setItem("selectedProjectId", selectedProjectId);

    } catch (error) {

        // Show a message if projects cannot be loaded.
        projectSelect.replaceChildren();

        const option = document.createElement("option");

        option.value = "";
        option.textContent = "Could not load projects";

        projectSelect.appendChild(option);

        console.error("Error loading projects:", error);
    }
}


// ============================================================
// 4. LOAD TASKS AND UPDATE STATISTICS
// ============================================================

async function loadTasks() {

    try {

        // Call GET /tasks and store all returned tasks.
        allTasks = await apiRequest("/tasks");

        // Recalculate the dashboard statistics.
        updateStatistics();

        // Apply project selection, search, and sorting.
        await refreshTaskList();

    } catch (error) {

        // Show an error if tasks could not be loaded.
        taskList.textContent = "Unable to load tasks. Please try again.";

        console.error("Error loading tasks:", error);
    }
}


// Update the four statistics cards.
function updateStatistics() {

    // Read the selected project ID.
    const selectedProjectId = projectSelect.value;

    // Keep only tasks belonging to the selected project.
    const projectTasks = allTasks.filter(task =>
        String(task.project_id) === selectedProjectId
    );

    // Display the total number of tasks.
    document.getElementById("total-tasks").textContent =
        projectTasks.length;

    // Count pending tasks.
    document.getElementById("pending-tasks").textContent =
        projectTasks.filter(task => task.status === "pending").length;

    // Count tasks currently in progress.
    document.getElementById("progress-tasks").textContent =
        projectTasks.filter(task => task.status === "in_progress").length;

    // Count completed tasks.
    document.getElementById("completed-tasks").textContent =
        projectTasks.filter(task => task.status === "completed").length;
}


// ============================================================
// 5. SEARCH, SORTING, AND PROJECT FILTERING
// ============================================================

async function refreshTaskList() {

    try {

        // Read the search text and remove surrounding spaces.
        const keyword = searchInput.value.trim();

        // Read the selected sorting option.
        const sortValue = sortSelect.value;

        // Start with all tasks already loaded from the backend.
        let visibleTasks = allTasks;

        // If a search keyword exists, call the search endpoint.
        if (keyword !== "") {

            // Encode the keyword so it is safe to put in a URL.
            const encodedKeyword = encodeURIComponent(keyword);

            // Call GET /tasks/search?keyword=...
            visibleTasks = await apiRequest(
                `/tasks/search?keyword=${encodedKeyword}`
            );

        }

        // If no keyword exists but priority sorting is selected,
        // call the backend sorting endpoint.
        else if (sortValue === "priority") {

            // Call GET /tasks?sort=priority
            visibleTasks = await apiRequest("/tasks?sort=priority");

        }

        // Display only tasks belonging to the selected project.
        visibleTasks = visibleTasks.filter(task =>
            String(task.project_id) === projectSelect.value
        );

        // If search and sorting are both active, sort search results here.
        if (keyword !== "" && sortValue === "priority") {

            // Define the order of task priorities.
            const priorityOrder = {
                high: 1,
                medium: 2,
                low: 3
            };

            // Sort from high priority to low priority.
            visibleTasks.sort((taskA, taskB) =>
                priorityOrder[taskA.priority] -
                priorityOrder[taskB.priority]
            );
        }

        // Display the final task list.
        renderTasks(visibleTasks);

    } catch (error) {

        // Show an error if searching or sorting fails.
        taskList.textContent = "Unable to display tasks.";

        console.error("Error refreshing tasks:", error);
    }
}


// ============================================================
// 6. DISPLAY TASK CARDS
// ============================================================

function renderTasks(tasks) {

    // Remove the previously displayed task cards.
    taskList.replaceChildren();

    // Check whether any tasks are available.
    if (tasks.length === 0) {

        // Create an empty-state message.
        const message = document.createElement("p");

        message.textContent = "No tasks found. Create your first task!";

        // Display the message inside the task list.
        taskList.appendChild(message);

        return;
    }

    // Create one task card for every task.
    tasks.forEach(task => {

        // Create the main card container.
        const card = document.createElement("div");
        card.className = "task-card";

        // Create and populate the task title.
        const title = document.createElement("h3");
        title.textContent = task.title;

        // Create and populate the priority.
        const priority = document.createElement("p");
        priority.textContent = `Priority: ${task.priority}`;

        // Create and populate the status.
        const status = document.createElement("p");
        status.textContent = `Status: ${task.status.replace("_", " ")}`;

        // Create and populate the due date.
        const dueDate = document.createElement("p");
        dueDate.textContent = `Due date: ${task.due_date || "Not set"}`;

        // Create the Edit button.
        const editButton = document.createElement("button");

        editButton.textContent = "Edit";

        // Store the button action in a data attribute.
        editButton.dataset.action = "edit";

        // Store the task ID in another data attribute.
        editButton.dataset.id = task.id;

        // Create the Delete button.
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = task.id;

        // Add the task information to the card.
        card.append(title, priority, status, dueDate);

        // Add the action buttons to the card.
        card.append(editButton, deleteButton);

        // Display the completed card on the webpage.
        taskList.appendChild(card);
    });
}


// ============================================================
// 7. CREATE OR UPDATE TASK
// ============================================================

// Listen for submission of the task form.
taskForm.addEventListener("submit", async function(event) {

    // Prevent the browser from refreshing the page.
    event.preventDefault();

    try {

        // Read the selected project ID.
        const projectId = projectSelect.value;

        // A task must belong to a project.
        if (!projectId) {
            throw new Error("Please select a project first.");
        }

        // Collect the form values into one JavaScript object.
        const taskData = {
            title: taskTitleInput.value.trim(),
            priority: taskPriorityInput.value,
            status: taskStatusInput.value,
            due_date: taskDueDateInput.value || null,
            project_id: Number(projectId)
        };

        // Prevent empty task titles.
        if (!taskData.title) {
            throw new Error("Task title cannot be empty.");
        }

        // Check whether the form is in edit mode.
        if (editingTaskId !== null) {

            // Update an existing task using PUT.
            await apiRequest(`/tasks/${editingTaskId}`, {
                method: "PUT",
                body: taskData
            });

            formMessage.textContent = "Task updated successfully!";

        } else {

            // Create a new task using POST.
            await apiRequest("/tasks", {
                method: "POST",
                body: taskData
            });

            formMessage.textContent = "Task created successfully!";
        }

        // Clear the form after a successful operation.
        taskForm.reset();

        // Return the form to create mode.
        resetEditMode();

        // Fetch the latest tasks from the backend.
        await loadTasks();

    } catch (error) {

        // Display the error message below the form.
        formMessage.textContent = error.message;

        console.error("Error saving task:", error);
    }
});


// ============================================================
// 8. EDIT TASK
// ============================================================

// Load an existing task into the form.
function editTask(taskId) {

    // Find the selected task in our local task array.
    const task = allTasks.find(item => item.id === taskId);

    // Stop if the task does not exist.
    if (!task) {
        formMessage.textContent = "Task not found.";
        return;
    }

    // Store the task ID to identify the task being edited.
    editingTaskId = task.id;

    // Fill the form with the existing task values.
    taskTitleInput.value = task.title;
    taskPriorityInput.value = task.priority;
    taskStatusInput.value = task.status;
    taskDueDateInput.value = task.due_date || "";

    // Select the project to which the task belongs.
    projectSelect.value = String(task.project_id);

    // Change the submit button label.
    submitButton.textContent = "Update Task";

    // Show the Cancel Edit button.
    cancelEditButton.hidden = false;

    // Display an editing message.
    formMessage.textContent = "Editing task. Update the fields and submit.";

    // Scroll the form into view.
    taskForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// Return the form to create mode.
function resetEditMode() {

    // Clear the ID of the task being edited.
    editingTaskId = null;

    // Restore the original button label.
    submitButton.textContent = "Create Task";

    // Hide the Cancel Edit button.
    cancelEditButton.hidden = true;
}


// Handle clicks on the Cancel Edit button.
cancelEditButton.addEventListener("click", function() {

    // Clear all form values.
    taskForm.reset();

    // Exit edit mode.
    resetEditMode();

    // Clear the previous message.
    formMessage.textContent = "";
});


// ============================================================
// 9. DELETE TASK
// ============================================================

async function deleteTask(taskId) {

    // Ask the user to confirm the deletion.
    const shouldDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    // Stop if the user cancels.
    if (!shouldDelete) {
        return;
    }

    try {

        // Call the DELETE /tasks/{id} endpoint.
        await apiRequest(`/tasks/${taskId}`, {
            method: "DELETE"
        });

        // Display a success message.
        formMessage.textContent = "Task deleted successfully!";

        // Reload tasks and update statistics.
        await loadTasks();

    } catch (error) {

        // Display the error message.
        formMessage.textContent = error.message;

        console.error("Error deleting task:", error);
    }
}


// ============================================================
// 10. EVENT DELEGATION FOR EDIT AND DELETE BUTTONS
// ============================================================

// Listen for clicks inside the task-list container.
taskList.addEventListener("click", function(event) {

    // Find the button that was clicked.
    const clickedButton = event.target.closest("button");

    // Ignore clicks that are not on a button inside the task list.
    if (!clickedButton || !taskList.contains(clickedButton)) {
        return;
    }

    // Read the action stored in the button.
    const action = clickedButton.dataset.action;

    // Read the task ID stored in the button.
    const taskId = Number(clickedButton.dataset.id);

    // Call the edit function when Edit is clicked.
    if (action === "edit") {
        editTask(taskId);
    }

    // Call the delete function when Delete is clicked.
    else if (action === "delete") {
        deleteTask(taskId);
    }
});


// ============================================================
// 11. SEARCH, SORTING, AND PROJECT EVENTS
// ============================================================

// Search tasks whenever the user types in the search input.
searchInput.addEventListener("input", function() {

    refreshTaskList();

});


// Apply sorting whenever the sorting dropdown changes.
sortSelect.addEventListener("change", function() {

    refreshTaskList();

});


// Handle a change in project selection.
projectSelect.addEventListener("change", function() {

    // Read the newly selected project ID.
    const selectedProjectId = projectSelect.value;

    // Save the selected project ID in Local Storage.
    localStorage.setItem("selectedProjectId", selectedProjectId);

    // Recalculate statistics for this project.
    updateStatistics();

    // Display tasks belonging to this project.
    refreshTaskList();

});


// ============================================================
// 12. INITIALIZE THE DASHBOARD
// ============================================================

// Initialize the dashboard when the page opens.
async function initializeDashboard() {

    // Load projects first so the project dropdown is ready.
    await loadProjects();

    // Then load tasks and update the dashboard.
    await loadTasks();

}


// Execute the initialization function.
initializeDashboard();