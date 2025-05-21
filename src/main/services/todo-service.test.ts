import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { TodoRepository } from '../repository/todo-repository';
import type { NotificationService } from './notification-service';
import { TodoService } from './todo-service';
import type { CreateTodo, Todo, UpdateTodo } from '#shared/domain/todo';
import { ValidationError } from '#shared/errors';

// Mock NotificationService
const mockNotificationService: NotificationService = {
  scheduleNotification: vi.fn(),
  cancelNotification: vi.fn(),
  rescheduleAllNotifications: vi.fn(),
};

// Mock TodoRepository
const mockTodoRepository: TodoRepository = {
  add: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(), // Added for completeness, may not be used in these specific tests
  getById: vi.fn(),  // Added for completeness
  toggle: vi.fn(),   // Added for completeness
};

describe('TodoService', () => {
  let todoService: TodoService;

  beforeEach(() => {
    todoService = new TodoService(mockTodoRepository, mockNotificationService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createTodo', () => {
    test('should call notificationService.scheduleNotification when a todo with reminderDateTime is created', async () => {
      const reminderDate = new Date(Date.now() + 3600 * 1000);
      const todoData: CreateTodo = { title: 'Test Todo with Reminder', reminderDateTime: reminderDate };
      const createdTodo: Todo = { 
        id: '1', 
        title: 'Test Todo with Reminder', 
        completed: false, 
        reminderDateTime: reminderDate 
      };
      
      mockTodoRepository.add.mockResolvedValue(createdTodo);

      await todoService.createTodo(todoData);

      expect(mockTodoRepository.add).toHaveBeenCalledWith(expect.objectContaining({title: todoData.title, reminderDateTime: reminderDate}));
      expect(mockNotificationService.scheduleNotification).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.scheduleNotification).toHaveBeenCalledWith(createdTodo);
    });

    test('should still create todo and not schedule if reminderDateTime is null', async () => {
      const todoData: CreateTodo = { title: 'Test Todo without Reminder', reminderDateTime: null };
       const createdTodo: Todo = { 
        id: '2', 
        title: 'Test Todo without Reminder', 
        completed: false, 
        reminderDateTime: null 
      };
      mockTodoRepository.add.mockResolvedValue(createdTodo);

      await todoService.createTodo(todoData);
      
      expect(mockTodoRepository.add).toHaveBeenCalled();
      expect(mockNotificationService.scheduleNotification).toHaveBeenCalledWith(createdTodo); // scheduleNotification will handle null reminderDateTime
    });

    test('should throw ValidationError if title is empty', async () => {
        const todoData: CreateTodo = { title: ' ', reminderDateTime: null };
        await expect(todoService.createTodo(todoData)).rejects.toThrow(ValidationError);
        expect(mockNotificationService.scheduleNotification).not.toHaveBeenCalled();
    });
  });

  describe('updateTodo', () => {
    test('should call notificationService.scheduleNotification when a todo is updated with a reminderDateTime', async () => {
      const reminderDate = new Date(Date.now() + 3600 * 1000);
      const todoId = '1';
      const updateData: UpdateTodo = { title: 'Updated Todo', reminderDateTime: reminderDate };
      const updatedTodo: Todo = { 
        id: todoId, 
        title: 'Updated Todo', 
        completed: false, 
        reminderDateTime: reminderDate 
      };
      
      mockTodoRepository.update.mockResolvedValue(updatedTodo);

      await todoService.updateTodo(todoId, updateData);

      expect(mockTodoRepository.update).toHaveBeenCalledWith(todoId, updateData);
      expect(mockNotificationService.scheduleNotification).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.scheduleNotification).toHaveBeenCalledWith(updatedTodo);
    });
    
    test('should call notificationService.scheduleNotification when reminder is cleared', async () => {
      const todoId = '1';
      const updateData: UpdateTodo = { reminderDateTime: null };
      const updatedTodo: Todo = { 
        id: todoId, 
        title: 'Reminder Cleared', 
        completed: false, 
        reminderDateTime: null 
      };
      
      mockTodoRepository.update.mockResolvedValue(updatedTodo);

      await todoService.updateTodo(todoId, updateData);

      expect(mockTodoRepository.update).toHaveBeenCalledWith(todoId, updateData);
      expect(mockNotificationService.scheduleNotification).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.scheduleNotification).toHaveBeenCalledWith(updatedTodo); // scheduleNotification handles null
    });
    
    test('should return null and not schedule if todo to update is not found', async () => {
      const todoId = 'non-existent';
      const updateData: UpdateTodo = { title: 'Try Update' };
      
      mockTodoRepository.update.mockResolvedValue(null); // Simulate not found

      const result = await todoService.updateTodo(todoId, updateData);
      
      expect(result).toBeNull();
      expect(mockNotificationService.scheduleNotification).not.toHaveBeenCalled();
    });
  });

  describe('removeTodo', () => {
    test('should call notificationService.cancelNotification when a todo is removed', async () => {
      const todoId = '1';
      mockTodoRepository.remove.mockResolvedValue(todoId); // Assume remove returns the ID of removed todo

      await todoService.removeTodo(todoId);

      expect(mockTodoRepository.remove).toHaveBeenCalledWith(todoId);
      expect(mockNotificationService.cancelNotification).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.cancelNotification).toHaveBeenCalledWith(todoId);
    });
  });

  describe('loadAndRescheduleAllNotifications', () => {
    test('should call notificationService.rescheduleAllNotifications with all todos', async () => {
      const now = new Date();
      const todos: Todo[] = [
        { id: 't1', title: 'Todo 1', completed: false, reminderDateTime: new Date(now.getTime() + 10000) },
        { id: 't2', title: 'Todo 2', completed: true, reminderDateTime: null },
      ];
      mockTodoRepository.findAll.mockResolvedValue(todos);

      await todoService.loadAndRescheduleAllNotifications();

      expect(mockTodoRepository.findAll).toHaveBeenCalledTimes(1);
      // The service converts reminderDateTime strings to Date objects before calling reschedule.
      // We need to ensure the mock is called with Date objects.
      const expectedTodosWithDateObjects = todos.map(todo => ({
        ...todo,
        reminderDateTime: todo.reminderDateTime ? new Date(todo.reminderDateTime) : null,
      }));
      expect(mockNotificationService.rescheduleAllNotifications).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.rescheduleAllNotifications).toHaveBeenCalledWith(expectedTodosWithDateObjects);
    });
  });

  describe('toggleTodo', () => {
    test('should call notificationService.scheduleNotification when a todo is toggled', async () => {
      const todoId = '1';
      const toggledTodo: Todo = { 
        id: todoId, 
        title: 'Toggled Todo', 
        completed: true, 
        reminderDateTime: new Date() 
      };
      
      mockTodoRepository.toggle.mockResolvedValue(toggledTodo);

      await todoService.toggleTodo(todoId);

      expect(mockTodoRepository.toggle).toHaveBeenCalledWith(todoId);
      expect(mockNotificationService.scheduleNotification).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.scheduleNotification).toHaveBeenCalledWith(toggledTodo);
      // This implies that if a todo is completed, its existing notification might be cancelled
      // or rescheduled by `scheduleNotification` if the reminder is still in the future.
      // If it's past, `scheduleNotification` won't schedule it.
    });

    test('should return null and not schedule if todo to toggle is not found', async () => {
      const todoId = 'non-existent';
      mockTodoRepository.toggle.mockResolvedValue(null); // Simulate not found

      const result = await todoService.toggleTodo(todoId);
      
      expect(result).toBeNull();
      expect(mockNotificationService.scheduleNotification).not.toHaveBeenCalled();
    });
  });
});
