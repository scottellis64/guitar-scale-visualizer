import { Task } from '../types';

class TaskService {
  private tasks: Map<string, Task> = new Map();

  createTask(type: Task['type'], input: any): Task {
    const task: Task = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      status: 'queued',
      input,
      output: null,
      error: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasks.set(task.id, task);
    return task;
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask = {
      ...task,
      ...updates,
      updatedAt: new Date()
    };

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }
}

export const taskService = new TaskService(); 