const Notification = require("../models/Notification");

/**
 * Creates an in-app notification. Fire-and-forget by design — a notification
 * failing to save should never break the primary request (e.g. booking an
 * appointment must still succeed even if the notification write fails).
 */
const notify = async ({ recipient, title, message, type = "system", link = "" }) => {
  try {
    if (!recipient) return null;
    return await Notification.create({ recipient, title, message, type, link });
  } catch (err) {
    console.error("Failed to create notification:", err.message);
    return null;
  }
};

/**
 * Notify many recipients at once (e.g. every admin when stock is low).
 */
const notifyMany = async (recipients = [], payload) => {
  await Promise.all(recipients.map((recipient) => notify({ ...payload, recipient })));
};

module.exports = { notify, notifyMany };
