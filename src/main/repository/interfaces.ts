/**
 * Generic Repository Interface
 * Defines standard operations for entity persistence
 */
export interface Repository<T, ID = string> {
  /** Retrieve all entities */
  findAll(): Promise<T[]>;

  /** Find entity by ID */
  findById?(id: ID): Promise<T | undefined>;

  /** Save a new entity */
  save?(entity: T): Promise<T>;

  /** Update an existing entity */
  update?(id: ID, entity: Partial<T>): Promise<T>;

  /** Delete an entity */
  delete?(id: ID): Promise<void>;
}
