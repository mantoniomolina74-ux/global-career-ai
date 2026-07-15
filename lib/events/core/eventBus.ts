type EventHandler<T = unknown> = (
  payload: T
) => void | Promise<void>;

class EventBus {
  private handlers: Record<string, EventHandler<unknown>[]> = {};

  on<T = unknown>(
    event: string,
    handler: EventHandler<T>
  ) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }

    this.handlers[event].push(
      handler as EventHandler<unknown>
    );
  }

  async emit<T>(
    event: string,
    payload: T
  ) {
    const handlers = this.handlers[event] || [];

    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await Promise.resolve(handler(payload));
        } catch (err) {
          console.error(
            `[eventBus:${event}] handler error`,
            err
          );
        }
      })
    );
  }
}

export const eventBus = new EventBus();