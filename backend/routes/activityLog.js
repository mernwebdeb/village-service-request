const roleCheck = require('../middleware/roleCheck');
const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middleware/auth');

// GET /api/activity-log — Get all activity logs (officials only)
router.get('/', auth, roleCheck('official'), async (req, res) => {
  try {
      return res.status(403).json({ message: 'Access denied. Officials only.' });
    

    const { requestId, action, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (requestId) filter.request = requestId;
    if (action) filter.action = action;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await ActivityLog.countDocuments(filter);

    const logs = await ActivityLog.find(filter)
      .populate('performedBy', 'name email role')
      .populate('request', 'title status category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch activity logs.' });
  }
});

// GET /api/activity-log/:requestId — Get logs for a specific request
router.get('/:requestId', auth, async (req, res) => {
  try {
    const logs = await ActivityLog.find({ request: req.params.requestId })
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch activity logs.' });
  }
});

module.exports = router;