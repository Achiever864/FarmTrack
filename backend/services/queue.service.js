/**
 * Lightweight in-process concurrency-limited asynchronous queue with retry and backoff.
 */
class AsyncQueue {
  constructor(concurrency = 3) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  /**
   * Enqueues an async task function with optional retry settings.
   * @param {Function} taskFn - async () => Promise<any>
   * @param {Object} options
   * @param {number} options.retries - Number of retries on 429/5xx (default: 3)
   * @param {number} options.initialDelayMs - Initial delay in ms for exponential backoff (default: 1000)
   */
  add(taskFn, { retries = 3, initialDelayMs = 1000 } = {}) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        taskFn,
        retries,
        initialDelayMs,
        currentAttempt: 0,
        resolve,
        reject,
      });
      this.processNext();
    });
  }

  processNext() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const item = this.queue.shift();
    this.running++;

    this.executeItem(item).finally(() => {
      this.running--;
      this.processNext();
    });
  }

  async executeItem(item) {
    try {
      const result = await item.taskFn();
      item.resolve(result);
    } catch (err) {
      item.currentAttempt++;
      const isRetryable =
        err.message?.includes("429") ||
        err.message?.includes("5") ||
        err.message?.includes("fetch failed") ||
        err.message?.includes("rate limit");

      if (isRetryable && item.currentAttempt <= item.retries) {
        const delay = item.initialDelayMs * Math.pow(2, item.currentAttempt - 1);
        console.warn(
          `[Queue] Task failed (attempt ${item.currentAttempt}/${item.retries}): ${err.message}. Retrying in ${delay}ms...`
        );
        setTimeout(() => {
          this.queue.unshift(item); // prioritize retry
          this.processNext();
        }, delay);
      } else {
        console.error(`[Queue] Task failed permanently: ${err.message}`);
        item.reject(err);
      }
    }
  }

  get pendingCount() {
    return this.queue.length;
  }

  get activeCount() {
    return this.running;
  }
}

const concurrency = parseInt(process.env.SYNC_CONCURRENCY || "3", 10);
export const backfillQueue = new AsyncQueue(concurrency);
export default AsyncQueue;
