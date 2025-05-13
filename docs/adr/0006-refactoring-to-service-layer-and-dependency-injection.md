---
title: "ADR-0006: Refactoring to Service Layer and Dependency Injection"
lastUpdated: 2025-05-11
tags: [adr, architecture, service-layer, dependency-injection, repository]
---

# ADR-0006: Refactoring to Service Layer and Dependency Injection

| Status  | Proposed   |
| ------- | ---------- |
| Date    | 2025-05-11 |
| Extends | ADR-0005   |

## Context

ADR-0005 established a cleaner separation between the main process and renderer by splitting the router into the main process and creating a universal shared layer. While this improved the architecture, there are still opportunities to enhance maintainability, testability, and scalability:

1. **Current repository pattern implementation** is functional but uses object literals without formal interfaces, making it harder to test and mock dependencies.

2. **Direct coupling to persistence layer** makes it difficult to switch storage implementations or create test doubles.

3. **Business logic in routers** creates tight coupling between API endpoints and logic implementation, making it harder to reuse code across different interfaces.

4. **Lack of dependency management** makes it challenging to control object lifecycle and dependencies, particularly for testing.

5. **Error handling is inconsistent**, with no standardized approach for communicating errors between layers.

As the application grows, these issues will become more apparent and potentially lead to maintenance challenges.

## Decision

We will refactor the codebase to incorporate:

1. **Formal Repository Interfaces** - Define explicit interfaces for repositories to ensure implementation consistency and support testing:

   ```typescript
   // src/main/repository/interfaces.ts
   export interface Repository<T, ID = string> {
     findAll(): Promise<T[]>;
     findById?(id: ID): Promise<T | undefined>;
     save?(entity: T): Promise<T>;
     update?(id: ID, entity: Partial<T>): Promise<T>;
     delete?(id: ID): Promise<void>;
   }
   ```

2. **Persistence Layer Abstraction** - Decouple repositories from direct storage implementation:

   ```typescript
   // src/main/persistence/store-interface.ts
   export interface PersistenceStore {
     get<T>(key: string): T;
     set<T>(key: string, value: T): void;
   }
   ```

3. **Class-based Repository Implementation** - Convert repositories from object literals to classes that implement interfaces:

   ```typescript
   // src/main/repository/todo-repository.ts
   export class TodoRepository implements Repository<Todo> {
     constructor(private store: PersistenceStore) {}

     async findAll(): Promise<Todo[]> {
       return this.store.get<Todo[]>("todos");
     }

     // Additional methods...
   }
   ```

4. **Service Layer Introduction** - Add a service layer between repositories and routers to encapsulate business logic:

   ```typescript
   // src/main/services/todo-service.ts
   export class TodoService {
     constructor(private repository: Repository<Todo>) {}

     async getAll(): Promise<Todo[]> {
       return this.repository.findAll();
     }

     // Additional methods with business logic...
   }
   ```

5. **Router Simplification** - With the service layer in place, routers focus on request validation and service invocation:

   ```typescript
   // src/main/trpc/routers/todo.ts
   export const todoRouter = router({
     list: publicProcedure.query(async () => {
       return todoService.getAll();
     }),

     // Additional routes...
   });
   ```

6. **Centralized Dependency Injection** - Initialize and connect dependencies in a single location:

   ```typescript
   // src/main/di/container.ts
   const store = new ElectronPersistenceStore({
     name: "settings",
     defaults: { todos: [], theme: "system" },
   });

   export const todoRepository = new TodoRepository(store);
   export const todoService = new TodoService(todoRepository);
   ```

7. **Enhanced Type Definitions and Validation** - Expand Zod schemas to better separate input/output types and validation:

   ```typescript
   // src/shared/domain/todo.ts
   export const CreateTodoSchema = z.object({
     title: z.string().min(1, "title required"),
   });

   export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
   ```

8. **Improved IPC Adapter** - Enhance type safety and error handling in the IPC adapter.

9. **Unified Error Handling** - Create a standard error hierarchy for consistent error management:

   ```typescript
   // src/shared/errors.ts
   export class AppError extends Error {
     constructor(
       message: string,
       public code: string = "APP_ERROR",
       public statusCode: number = 400,
       public details?: unknown,
     ) {
       super(message);
       this.name = "AppError";
     }
   }
   ```

10. **Organized Main Entry Point** - Separate initialization logic from event handling for cleaner startup flow.

## Consequences

### Positive

- **Increased Testability** - Interfaces and dependency injection make unit testing much easier
- **Clearer Separation of Concerns** - Each layer has a focused, single responsibility
- **Improved Maintainability** - Code is more modular and easier to understand
- **Enhanced Scalability** - New features can follow established patterns
- **Better Error Handling** - Standardized errors improve debugging and user experience
- **Reduced Coupling** - Components depend on abstractions instead of concrete implementations

### Negative

- **Increased Boilerplate** - More files and interfaces to maintain
- **Higher Learning Curve** - New developers need to understand the architecture pattern
- **Migration Effort** - Existing code needs refactoring to match the new pattern

### Neutral

- **Architectural Alignment** - Brings codebase closer to standard enterprise patterns
- **Preparation for Growth** - Establishes patterns that will be valuable as application complexity increases

## Alternatives Considered

| Alternative                      | Description                                  | Why Rejected                                                    |
| -------------------------------- | -------------------------------------------- | --------------------------------------------------------------- |
| Keep object literal repositories | Continue using simple object exports         | Limited testability and harder to maintain as application grows |
| Use a third-party DI container   | Adopt libraries like InversifyJS or tsyringe | Adds unnecessary dependencies for our current scale             |
| Full Clean Architecture          | Add more layers (e.g., use cases)            | Would be over-engineering for current application complexity    |
| External configuration           | Move configuration to external files         | Unnecessary complexity for current needs                        |

## Implementation Plan

The implementation will proceed in phases to minimize disruption:

1. Add interfaces without changing existing code
2. Implement persistence abstraction
3. Convert one repository to class-based (Todo first)
4. Add service layer for Todo
5. Update Todo router to use service
6. Add centralized dependency container
7. Repeat for Theme and other domains
8. Enhance error handling across application
9. Update tests to leverage new architecture

## References

- ADR-0003: _Persistence Repository Pattern with Electron-Store_
- ADR-0005: _Split Router and Establish Universal Shared Layer_
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Dependency Injection Pattern](https://en.wikipedia.org/wiki/Dependency_injection)
- [Service Layer Pattern](https://martinfowler.com/eaaCatalog/serviceLayer.html)
