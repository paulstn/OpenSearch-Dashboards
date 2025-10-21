/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Manages a queue of async query operations with a configurable concurrency limit.
 *
 * This class helps prevent overwhelming the OpenSearch cluster by limiting the number
 * of concurrent queries that can execute at once. Queries beyond the limit are queued
 * and executed as slots become available.
 *
 * @example
 * ```typescript
 * const queueManager = new QueryQueueManager(10); // Max 10 concurrent queries
 *
 * // Enqueue queries - they'll execute when a slot is available
 * const result1 = await queueManager.enqueue(() => fetchData1());
 * const result2 = await queueManager.enqueue(() => fetchData2());
 *
 * // Clear pending queries (won't affect currently executing queries)
 * queueManager.clear();
 * ```
 */
export class QueryQueueManager {
  private maxConcurrent: number;
  private currentlyRunning: number = 0;
  private queue: Array<{
    execute: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private cancelled: boolean = false;

  /**
   * Creates a new QueryQueueManager
   * @param maxConcurrent Maximum number of queries that can run concurrently (default: 10)
   */
  constructor(maxConcurrent: number = 10) {
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Enqueues a query function to be executed
   * @param queryFn The async function to execute
   * @returns Promise that resolves with the query result
   */
  enqueue<T>(queryFn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        execute: queryFn,
        resolve,
        reject,
      });
      this.processQueue();
    });
  }

  /**
   * Clears all pending queries in the queue
   * Currently executing queries will continue to run
   */
  clear(): void {
    this.cancelled = true;
    // Reject all queued items
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) {
        item.reject(new Error('Query cancelled'));
      }
    }
    this.cancelled = false;
  }

  /**
   * Processes the queue, executing queries up to the concurrency limit
   */
  private processQueue(): void {
    // Don't process if cancelled or at capacity
    if (this.cancelled || this.currentlyRunning >= this.maxConcurrent) {
      return;
    }

    // Don't process if queue is empty
    if (this.queue.length === 0) {
      return;
    }

    // Start executing queries up to the concurrency limit
    while (this.currentlyRunning < this.maxConcurrent && this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) {
        break;
      }

      this.currentlyRunning++;

      // Execute the query
      item
        .execute()
        .then((result) => {
          item.resolve(result);
        })
        .catch((error) => {
          item.reject(error);
        })
        .finally(() => {
          this.currentlyRunning--;
          // Process next items in queue
          this.processQueue();
        });
    }
  }
}
