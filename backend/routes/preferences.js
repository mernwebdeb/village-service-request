const express = require('express');
const router = express.Router();
const NotificationPreference = require('../models/NotificationPreference');
const auth = require('../middleware/auth');

// GET /api/preferences — Get user preferences
router.get('/', auth, async (req, res) => {
  try {
    let prefs = await NotificationPreference.findOne({ user: req.user._id });

    // Create default preferences if none exist
    if (!prefs) {
      prefs = await NotificationPreference.create({ user: req.user._id });
    }

    res.json({ preferences: prefs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch preferences.' });
  }
});

// PATCH /api/preferences — Update user preferences
router.patch('/', auth, async (req, res) => {
  try {
    const { emailOnStatusChange, emailOnNewMessage, emailOnNewRequest, inAppNotifications } = req.body;

    let prefs = await NotificationPreference.findOne({ user: req.user._id });

    if (!prefs) {
      prefs = new NotificationPreference({ user: req.user._id });
    }

    if (emailOnStatusChange !== undefined) prefs.emailOnStatusChange = emailOnStatusChange;
    if (emailOnNewMessage !== undefined) prefs.emailOnNewMessage = emailOnNewMessage;
    if (emailOnNewRequest !== undefined) prefs.emailOnNewRequest = emailOnNewRequest;
    if (inAppNotifications !== undefined) prefs.inAppNotifications = inAppNotifications;

    await prefs.save();

    res.json({ message: 'Preferences updated successfully', preferences: prefs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update preferences.' });
  }
});

module.exports = router;