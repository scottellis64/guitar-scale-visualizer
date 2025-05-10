import { QueueItem } from '../types';
import { taskService } from './task_service';

class QueueService {
  private queue: QueueItem[] = [];
  private isProcessing = false;

  async addToQueue(item: QueueItem) {
    this.queue.push(item);
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const item = this.queue.shift()!;

    try {
      // Update task status to processing
      taskService.updateTask(item.taskId, { status: 'processing' });

      // Process the item based on its type
      switch (item.type) {
        case 'download':
          // Handle download
          break;
        case 'convert':
          // Handle conversion
          break;
        case 'extract':
          // Handle extraction
          break;
      }

      // Update task status to completed
      taskService.updateTask(item.taskId, { status: 'completed' });
    } catch (error) {
      // Update task status to failed
      taskService.updateTask(item.taskId, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Process next item
    await this.processQueue();
  }
}

export const queueService = new QueueService(); 