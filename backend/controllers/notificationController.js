const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

// @route   GET /api/notifications
// @access  Private — only the logged-in user's own notifications
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(50);

  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

  res.status(200).json({ success: true, count: notifications.length, unreadCount, data: notifications });
});

// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw new AppError("Notification not found", 404, "NOTIFICATION_NOT_FOUND");
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw new AppError("Not authorized to modify this notification", 403, "FORBIDDEN");
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({ success: true, data: notification });
});

// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.status(200).json({ success: true, message: "All notifications marked as read" });
});

// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw new AppError("Notification not found", 404, "NOTIFICATION_NOT_FOUND");
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw new AppError("Not authorized to delete this notification", 403, "FORBIDDEN");
  }

  await notification.deleteOne();
  res.status(200).json({ success: true, message: "Notification deleted" });
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead, deleteNotification };
