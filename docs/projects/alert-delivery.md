# Safer alert delivery

**Problem:** a notification integration could include sensitive destination data in an error message.

**Decision:** add a small relay between the alert source and notification destination. The relay owns forwarding and limits what it records and sends.

## How the integration works

The documented path is CrowdSec → relay → Telegram. The relay provides a boundary between the detector's notification format and the destination-specific delivery details. It limits messages to fields needed for an alert and avoids copying raw event data into routine logs. Detection remains separate from notification transport; the relay does not perform remediation.

The trade-off is another component to maintain and a notification with less raw context. That is preferable to passing a sensitive destination through an error-prone integration path.

**Evidence:** historical checks used a synthetic failure and a test notification. A later inspection did not send a message, so it did not re-establish delivery at that time.

**Source dates:** 2026-10-06 and 2026-10-09.

**Limit:** the records do not establish current configuration or end-to-end delivery today. They also do not prove that every possible logging path is free of sensitive data.

**Lesson:** test failure paths with synthetic values; a successful request alone cannot show that errors are safe. Operational endpoints, tokens, message templates, and service policies are intentionally omitted.
