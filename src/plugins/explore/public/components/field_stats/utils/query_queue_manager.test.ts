/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { QueryQueueManager } from './query_queue_manager';

describe('QueryQueueManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('executes queries up to max concurrency limit', async () => {
      const queueManager = new QueryQueueManager(3);
      const activeQueries: number[] = [];
      let maxActive = 0;

      const createQuery = (id: number) => async () => {
        activeQueries.push(id);
        maxActive = Math.max(maxActive, activeQueries.length);
        await new Promise((resolve) => setTimeout(resolve, 10));
        activeQueries.splice(activeQueries.indexOf(id), 1);
        return id;
      };

      const promises = [1, 2, 3, 4, 5].map((id) => queueManager.enqueue(createQuery(id)));

      await Promise.all(promises);
      expect(maxActive).toBe(3);
    });

    it('queues additional queries beyond the limit', async () => {
      const queueManager = new QueryQueueManager(2);
      const executionOrder: number[] = [];

      const createQuery = (id: number, delay: number) => async () => {
        executionOrder.push(id);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return id;
      };

      const promises = [
        queueManager.enqueue(createQuery(1, 50)),
        queueManager.enqueue(createQuery(2, 50)),
        queueManager.enqueue(createQuery(3, 10)),
        queueManager.enqueue(createQuery(4, 10)),
      ];

      await Promise.all(promises);

      // First two should start immediately
      expect(executionOrder.slice(0, 2)).toEqual([1, 2]);
      // Next two should start after first batch
      expect(executionOrder.slice(2, 4)).toEqual([3, 4]);
    });

    it('executes queued queries as slots free up', async () => {
      const queueManager = new QueryQueueManager(2);
      const completionOrder: number[] = [];

      const createQuery = (id: number, delay: number) => async () => {
        await new Promise((resolve) => setTimeout(resolve, delay));
        completionOrder.push(id);
        return id;
      };

      const promises = [
        queueManager.enqueue(createQuery(1, 30)),
        queueManager.enqueue(createQuery(2, 60)),
        queueManager.enqueue(createQuery(3, 10)),
      ];

      await Promise.all(promises);

      // Query 1 finishes first, then query 3 starts and finishes, then query 2
      expect(completionOrder).toEqual([1, 3, 2]);
    });

    it('resolves promises with correct results', async () => {
      const queueManager = new QueryQueueManager(5);

      const results = await Promise.all([
        queueManager.enqueue(async () => 'result1'),
        queueManager.enqueue(async () => 42),
        queueManager.enqueue(async () => ({ key: 'value' })),
      ]);

      expect(results).toEqual(['result1', 42, { key: 'value' }]);
    });
  });

  describe('error handling', () => {
    it('handles query errors without blocking the queue', async () => {
      const queueManager = new QueryQueueManager(2);
      const results: any[] = [];

      const queries = [
        queueManager
          .enqueue(async () => {
            throw new Error('Query 1 failed');
          })
          .catch((error) => error.message),
        queueManager.enqueue(async () => 'success'),
        queueManager
          .enqueue(async () => {
            throw new Error('Query 3 failed');
          })
          .catch((error) => error.message),
        queueManager.enqueue(async () => 'also success'),
      ];

      const settled = await Promise.all(queries);

      expect(settled).toHaveLength(4);
      expect(settled).toContain('Query 1 failed');
      expect(settled).toContain('success');
      expect(settled).toContain('Query 3 failed');
      expect(settled).toContain('also success');
    });

    it('rejects individual promises on error', async () => {
      const queueManager = new QueryQueueManager(5);

      await expect(
        queueManager.enqueue(async () => {
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');
    });
  });

  describe('cancellation', () => {
    it('supports clearing the queue', async () => {
      const queueManager = new QueryQueueManager(1);
      const executionOrder: number[] = [];

      const createQuery = (id: number) => async () => {
        executionOrder.push(id);
        await new Promise((resolve) => setTimeout(resolve, 50));
        return id;
      };

      // Start first query (will execute)
      const promise1 = queueManager.enqueue(createQuery(1));

      // Queue more queries (will be queued) and immediately prepare to catch cancellations
      const promise2 = queueManager.enqueue(createQuery(2)).catch((e) => e);
      const promise3 = queueManager.enqueue(createQuery(3)).catch((e) => e);

      // Clear the queue before queued items execute
      await new Promise((resolve) => setTimeout(resolve, 10));
      queueManager.clear();

      // Wait for first query to complete
      await promise1;

      // Queued queries should have been rejected
      const error2 = await promise2;
      const error3 = await promise3;
      expect(error2.message).toBe('Query cancelled');
      expect(error3.message).toBe('Query cancelled');

      // Only first query should have executed
      expect(executionOrder).toEqual([1]);
    });

    it('can enqueue new queries after clearing', async () => {
      const queueManager = new QueryQueueManager(1);

      // Add a slow query and clear before it completes
      const clearedPromise = queueManager
        .enqueue(async () => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          return 'test';
        })
        .catch((e) => e);

      // Give it a moment to start then clear
      await new Promise((resolve) => setTimeout(resolve, 5));
      queueManager.clear();

      const error = await clearedPromise;
      // If it was in the queue, it should be cancelled; if it started executing, it will complete
      // Either way, we can enqueue new queries

      // Add new queries
      const result = await queueManager.enqueue(async () => 'new query');
      expect(result).toBe('new query');
    });
  });

  describe('concurrency limits', () => {
    it('works with concurrency limit of 1', async () => {
      const queueManager = new QueryQueueManager(1);
      const executionOrder: number[] = [];

      const createQuery = (id: number) => async () => {
        executionOrder.push(id);
        await new Promise((resolve) => setTimeout(resolve, 10));
        return id;
      };

      await Promise.all([
        queueManager.enqueue(createQuery(1)),
        queueManager.enqueue(createQuery(2)),
        queueManager.enqueue(createQuery(3)),
      ]);

      expect(executionOrder).toEqual([1, 2, 3]);
    });

    it('works with large concurrency limit', async () => {
      const queueManager = new QueryQueueManager(100);
      const activeQueries: number[] = [];
      let maxActive = 0;

      const createQuery = (id: number) => async () => {
        activeQueries.push(id);
        maxActive = Math.max(maxActive, activeQueries.length);
        await new Promise((resolve) => setTimeout(resolve, 10));
        activeQueries.splice(activeQueries.indexOf(id), 1);
        return id;
      };

      const promises = Array.from({ length: 50 }, (_, i) => queueManager.enqueue(createQuery(i)));

      await Promise.all(promises);
      // All 50 queries should run in parallel since limit is 100
      expect(maxActive).toBe(50);
    });

    it('defaults to 10 concurrent queries when not specified', async () => {
      const queueManager = new QueryQueueManager();
      const activeQueries: number[] = [];
      let maxActive = 0;

      const createQuery = (id: number) => async () => {
        activeQueries.push(id);
        maxActive = Math.max(maxActive, activeQueries.length);
        await new Promise((resolve) => setTimeout(resolve, 20));
        activeQueries.splice(activeQueries.indexOf(id), 1);
        return id;
      };

      const promises = Array.from({ length: 25 }, (_, i) => queueManager.enqueue(createQuery(i)));

      await Promise.all(promises);
      expect(maxActive).toBe(10);
    });
  });

  describe('execution order', () => {
    it('executes queries in FIFO order', async () => {
      const queueManager = new QueryQueueManager(1);
      const executionOrder: number[] = [];

      const createQuery = (id: number) => async () => {
        executionOrder.push(id);
        await new Promise((resolve) => setTimeout(resolve, 5));
        return id;
      };

      await Promise.all([
        queueManager.enqueue(createQuery(1)),
        queueManager.enqueue(createQuery(2)),
        queueManager.enqueue(createQuery(3)),
        queueManager.enqueue(createQuery(4)),
        queueManager.enqueue(createQuery(5)),
      ]);

      expect(executionOrder).toEqual([1, 2, 3, 4, 5]);
    });

    it('maintains FIFO order even with varying query durations', async () => {
      const queueManager = new QueryQueueManager(2);
      const executionStartOrder: number[] = [];

      const createQuery = (id: number, delay: number) => async () => {
        executionStartOrder.push(id);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return id;
      };

      await Promise.all([
        queueManager.enqueue(createQuery(1, 50)),
        queueManager.enqueue(createQuery(2, 10)),
        queueManager.enqueue(createQuery(3, 5)),
        queueManager.enqueue(createQuery(4, 5)),
      ]);

      // 1 and 2 start first, then when 2 finishes, 3 starts, then 4
      expect(executionStartOrder).toEqual([1, 2, 3, 4]);
    });
  });

  describe('edge cases', () => {
    it('handles empty queue gracefully', async () => {
      const queueManager = new QueryQueueManager(5);
      queueManager.clear();
      // Should not throw
      expect(() => queueManager.clear()).not.toThrow();
    });

    it('handles immediate query resolution', async () => {
      const queueManager = new QueryQueueManager(5);
      const result = await queueManager.enqueue(async () => 'immediate');
      expect(result).toBe('immediate');
    });

    it('handles synchronous errors', async () => {
      const queueManager = new QueryQueueManager(5);

      await expect(
        queueManager.enqueue(async () => {
          throw new Error('Sync error');
        })
      ).rejects.toThrow('Sync error');
    });

    it('handles multiple clears', async () => {
      const queueManager = new QueryQueueManager(1);

      // Enqueue multiple queries that will be queued (concurrency limit is 1)
      // First query starts executing, rest are queued
      const promise1 = queueManager
        .enqueue(async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return 'test1';
        })
        .catch((e) => e);

      const promise2 = queueManager.enqueue(async () => 'test2').catch((e) => e);
      const promise3 = queueManager.enqueue(async () => 'test3').catch((e) => e);

      // Clear should cancel queued items (2 and 3), but 1 is already executing
      queueManager.clear();

      const result2 = await promise2;
      const result3 = await promise3;

      // Promises 2 and 3 should be cancelled
      expect(result2.message).toBe('Query cancelled');
      expect(result3.message).toBe('Query cancelled');

      // Calling clear again should not throw
      expect(() => queueManager.clear()).not.toThrow();

      // Wait for promise1 to complete (it was executing, not queued)
      await promise1;
    });
  });
});
