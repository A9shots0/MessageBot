📚 Bot Functional Specification – Discord Solution Bot
🎯 Primary Functionality
The bot monitors public channels for user messages that match predefined trigger phrases. Upon detecting a trigger, it automatically responds by:

Sending the user a direct message (DM) with helpful information.

If DMs are blocked, creating a private thread and sending the response there.

If both fail, sending a minimal public reply to notify the user.

📋 Detailed Functional Behavior
✅ 1. Trigger Detection
Monitors all public text channels (excluding specified ignore channels).

Trigger phrases are case-insensitive.

Supports:

Exact phrase matching.

Regex patterns for flexible detection.

Fuzzy matching (e.g., “how to join” ≈ “how join”).

Trigger-response mappings are stored in JSON or a lightweight database.

✅ 2. Cooldown System
Prevents spamming users with repeated responses.

Default cooldown: 24 hours per trigger per user (configurable).

Cooldown data stored in-memory (Map) with optional Redis persistence for scale.

Admins can manually reset cooldowns via command.

✅ 3. Response Delivery Flow
plaintext
Copy
Edit
Trigger Detected 
    └── Attempt DM 
          ├── Success → Done
          └── Fail → Attempt Private Thread 
                       ├── Success → Done
                       └── Fail → Public Minimal Reply
✅ 4. Private Thread Fallback
Creates a private thread under the original message.

Invites the user to the thread.

Posts the response in the thread.

Auto-archives thread after a configurable time (e.g., 1 hour).

✅ 5. Rate Limiting & Queueing
Respects Discord API rate limits.

Implements a DM job queue to delay mass responses during high activity.

Optional exponential backoff if rate limits are hit.

✅ 6. Admin Commands (/slash)
Command	Description
/trigger add	Add a new trigger phrase and response.
/trigger remove	Remove a trigger phrase.
/cooldown reset	Reset cooldown for a specific user.
/stats	Display total DMs sent, failures, and top triggers.
/triggers list	List all current triggers.

✅ 7. Logging & Analytics
Tracks:

Number of successful DMs sent.

Number of fallback thread creations.

DM failure reasons.

Most commonly triggered phrases.

Exports logs as JSON or plain text.

✅ 8. Additional Features
Optional random DM delay (1-5 seconds) to mimic human behavior.

Configurable response templates (with variable placeholders).

Public opt-out mechanism for users who don’t want bot interactions.

Admin role restrictions for sensitive commands.

