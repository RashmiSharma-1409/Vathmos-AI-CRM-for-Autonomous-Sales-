from datetime import datetime
from database.db import log_pipeline_event, get_pipeline_events


def log_event(entity_id, entity_type, event_type, data):
    """
    Persists a pipeline event to SQLite.
    Drop-in replacement for the old in-memory list append.
    Signature identical — zero changes needed in pipeline.py or any agent.
    """
    event = {
        "entity_id": entity_id,
        "entity_type": entity_type,
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "data": data
    }

    log_pipeline_event(entity_id, entity_type, event_type, data)
    try:
        print("\n🧠 EVENT LOGGED:", event)
    except UnicodeEncodeError:
        print("\n[AI] EVENT LOGGED:", event)
    return event


def get_timeline(entity_id):
    """
    Reads all events for an entity from SQLite.
    Drop-in replacement for the old list filter.
    Agents call this identically — no changes needed anywhere else.
    """
    return get_pipeline_events(entity_id)