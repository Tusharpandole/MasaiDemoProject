
# Sort tasks by priority using Bubble Sort.
def bubble_sort_tasks(tasks):
    # Copy the list so the original list is not modified.
    sorted_tasks = tasks.copy()

    # Give each priority a numeric rank.
    priority_rank = {
        "low": 1,
        "medium": 2,
        "high": 3
    }

    # Count how many adjacent comparisons we make.
    comparisons = 0

    # Get the total number of tasks.
    n = len(sorted_tasks)

    # Each pass places another task in its correct position.
    for i in range(n):
        # The final i elements are already in position.
        for j in range(0, n - i - 1):
            comparisons += 1

            # Swap adjacent tasks if they are in the wrong order.
            if (
                priority_rank[sorted_tasks[j].priority]
                > priority_rank[sorted_tasks[j + 1].priority]
            ):
                sorted_tasks[j], sorted_tasks[j + 1] = (
                    sorted_tasks[j + 1],
                    sorted_tasks[j]
                )

    # Return both the sorted tasks and comparison count.
    return sorted_tasks, comparisons


# Find tasks whose titles contain a keyword.
def linear_search_tasks(tasks, keyword):
    # Store matching tasks here.
    matches = []

    # Count how many tasks we inspect.
    comparisons = 0

    # Make the search case-insensitive.
    keyword = keyword.lower()

    # Inspect each task one by one.
    for task in tasks:
        comparisons += 1

        # Check whether the keyword appears in the title.
        if keyword in task.title.lower():
            matches.append(task)

    # Return the matches and number of inspected tasks.
    return matches, comparisons
