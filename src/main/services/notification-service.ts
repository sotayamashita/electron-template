import { Notification } from 'electron';
import schedule from 'node-schedule';
import { Todo } from '../../shared/domain/todo';

export class NotificationService {
  constructor() {
    // Dependencies like a logger can be added here later
  }

  private getJobName(todoId: string): string {
    return `reminder-${todoId}`;
  }

  public scheduleNotification(todo: Todo): void {
    const jobName = this.getJobName(todo.id);

    // Cancel any existing job for this todo.id
    const existingJob = schedule.scheduledJobs[jobName];
    if (existingJob) {
      existingJob.cancel();
    }

    if (todo.reminderDateTime && todo.reminderDateTime.getTime() > Date.now()) {
      schedule.scheduleJob(jobName, todo.reminderDateTime, () => {
        console.log(`Triggering reminder for to-do: ${todo.title}`);
        new Notification({
          title: 'To-Do Reminder',
          body: todo.title,
        }).show();
        // Optional: Mark the job as done or remove it if it's a one-time notification
        // and the job itself doesn't get automatically removed after execution.
        // For node-schedule, jobs are typically removed after they execute if they are not recurring.
      });
      console.log(`Scheduled notification for to-do: ${todo.title} at ${todo.reminderDateTime}`);
    } else if (todo.reminderDateTime) {
      console.log(`Reminder for to-do: ${todo.title} is in the past. Not scheduling.`);
    }
  }

  public cancelNotification(todoId: string): void {
    const jobName = this.getJobName(todoId);
    const job = schedule.scheduledJobs[jobName];
    if (job) {
      job.cancel();
      console.log(`Cancelled notification for to-do ID: ${todoId}`);
    }
  }

  public rescheduleAllNotifications(todos: Todo[]): void {
    console.log(`Rescheduling notifications for ${todos.length} to-dos.`);
    for (const todo of todos) {
      // Ensure reminderDateTime is a Date object if it's coming from persistence (e.g., JSON string)
      // This might be necessary if electron-store doesn't auto-convert to Date objects on load.
      // For now, we assume it's correctly typed as `Date | null` based on the domain.
      // If issues arise, a transformation step would be needed here.
      if (todo.reminderDateTime) {
         // If reminderDateTime is stored as a string (e.g., ISO string from JSON), convert it to a Date object.
        const reminderDate = new Date(todo.reminderDateTime);
        if (!isNaN(reminderDate.getTime())) {
          const todoWithDateObject = { ...todo, reminderDateTime: reminderDate };
          this.scheduleNotification(todoWithDateObject);
        } else {
          console.warn(`Invalid reminderDateTime for todo ${todo.id}: ${todo.reminderDateTime}`);
        }
      }
    }
  }
}

export const notificationServiceInstance = new NotificationService();
