---
title: "ADR-0007: Reminders and Notifications Feature"
lastUpdated: 2024-03-15
tags: [adr, reminders, notifications, feature]
---

# ADR-0007: Reminders and Notifications Feature

| Status | Proposed |
| ------ | -------- |

## Context

Users need a way to be reminded of their tasks to improve productivity and ensure timely completion. Currently, the application functions as a passive to-do list. Adding reminders and notifications will transform it into a more active task management tool. This feature was prioritized by the user after an initial feature ideation phase.

## Decision

We will implement a reminders and notifications feature with the following characteristics:
1.  **Data Model:**
    *   Extend the existing `Todo` domain model (`src/shared/domain/todo.ts`) with an optional `reminderDateTime: Date | null` field.
    *   This field will store the specific date and time for the reminder. If null, no reminder is set.
2.  **User Interface:**
    *   In the to-do creation and editing forms (within `src/renderer/src/components/`), add a date/time picker component to allow users to set or clear `reminderDateTime`.
    *   Display the scheduled reminder time clearly when viewing a to-do item.
3.  **Scheduling & Triggering:**
    *   Utilize the `node-schedule` library in the main process for robust cron-like job scheduling. This library is well-tested and provides flexibility for scheduling tasks.
    *   A new `NotificationService` (`src/main/services/notification-service.ts`) will be created.
    *   This service will be responsible for:
        *   Scheduling a job when a `Todo` with a `reminderDateTime` is created or updated.
        *   Cancelling the scheduled job if the `Todo` is deleted, completed, or its `reminderDateTime` is cleared or changed.
        *   Loading all active reminders from persistent storage on application startup and scheduling them.
    *   When a scheduled job triggers, the `NotificationService` will use Electron's `Notification` API to display a system notification. The notification should include the to-do title.
4.  **Persistence:**
    *   The `reminderDateTime` will be persisted as part of the `Todo` object via the existing `TodoRepository` and `electron-store`.
5.  **Service Layer Integration:**
    *   The `TodoService` will invoke the `NotificationService` to manage scheduling/unscheduling of reminders when to-dos are created, updated, or deleted.

## Consequences

*   **Positive:**
    *   Increased user engagement and task completion rates.
    *   Enhanced value proposition of the application as a proactive task manager.
    *   Provides a foundation for potentially more advanced scheduling features later (e.g., recurring tasks).
*   **Negative/Challenges:**
    *   Increased complexity in the main process due to managing scheduled jobs.
    *   Need to ensure reliable persistence and re-scheduling of reminders after application restarts.
    *   Notifications need to be designed to be helpful and not intrusive.
    *   Cross-platform testing for notifications will be important.
    *   Potential minor increase in resource usage (e.g., memory for `node-schedule`).
*   **Neutral:**
    *   Introduces a new dependency (`node-schedule`).

## Alternatives considered

| Alternative                                  | Why rejected                                                                                                                              |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Simple `setTimeout` / `setInterval` polling  | Less robust for persistent scheduling, especially across app restarts. `node-schedule` offers more features like cron syntax and job management. |
| Using a dedicated reminder SaaS API          | Overkill for a local Electron app; adds external dependency and potential cost. Defeats the purpose of a local-first application.           |
| Custom polling mechanism in renderer process | Not suitable for triggering notifications when the app window might be closed or in the background. Main process is the correct location.    |
| Other scheduling libraries (e.g., `node-cron`) | `node-schedule` is popular, well-maintained, and offers a good balance of features and ease of use for this requirement.                   |

## References

- Electron `Notification` API documentation
- `node-schedule` library documentation
- @docs/adr/0003-persistence-repository-pattern-with-electron-store.md
