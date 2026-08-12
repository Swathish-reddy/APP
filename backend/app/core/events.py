import asyncio
import logging
from collections.abc import Awaitable, Callable
from typing import Any

logger = logging.getLogger(__name__)

# Standard Event Types
EVENT_DOCUMENT_UPLOADED = "DOCUMENT_UPLOADED"
EVENT_VITALS_UPDATED = "VITALS_UPDATED"
EVENT_MEDICATION_CHANGED = "MEDICATION_CHANGED"
EVENT_DIAGNOSIS_ADDED = "DIAGNOSIS_ADDED"
EVENT_TWIN_UPDATED = "TWIN_UPDATED"
EVENT_SIMULATION_COMPLETED = "SIMULATION_COMPLETED"
EVENT_RECOMMENDATION_GENERATED = "RECOMMENDATION_GENERATED"

class EventBus:
    def __init__(self):
        # Maps event_type to a list of async handler functions
        self.subscribers: dict[str, list[Callable[[dict[str, Any]], Awaitable[None]]]] = {}
        self.queue = asyncio.Queue()
        self._task = None

    def subscribe(self, event_type: str, handler: Callable[[dict[str, Any]], Awaitable[None]]):
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(handler)
        logger.info(f"Subscribed handler to {event_type}")

    async def publish(self, event_type: str, payload: dict[str, Any]):
        """Publish an event to the bus."""
        event = {"type": event_type, "payload": payload}
        await self.queue.put(event)
        logger.info(f"Event published: {event_type}")

    async def _process_events(self):
        while True:
            try:
                event = await self.queue.get()
                event_type = event["type"]
                payload = event["payload"]
                
                handlers = self.subscribers.get(event_type, [])
                for handler in handlers:
                    try:
                        await handler(payload)
                    except Exception as e:
                        logger.error(f"Error handling event {event_type}: {e}")
                        
                self.queue.task_done()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Event processing error: {e}")

    def start(self):
        """Start the event processing loop."""
        if self._task is None:
            self._task = asyncio.create_task(self._process_events())

    def stop(self):
        """Stop the event processing loop."""
        if self._task:
            self._task.cancel()
            self._task = None

# Global Singleton Instance
event_bus = EventBus()
