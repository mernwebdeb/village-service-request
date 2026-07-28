const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { sendEmail, getStatusChangeEmail, getNewRequestEmail } = require('../utils/emailService');

// POST /api/requests — Create a new request
router.post('/', auth, async (req, res) => {
  try {
    const { title, category, description, location, urgency } = req.body;

    const newRequest = new Request({
      title,
      category,
      description,
      location,
      urgency,
      citizen: req.user._id,
    });

    const savedRequest = await newRequest.save();

    // Log activity
    await ActivityLog.create({
      request: savedRequest._id,
      performedBy: req.user._id,
      action: 'created',
      description: `created a new request: "${savedRequest.title}"`,
    });

    // Email notification to officials
    try {
      const officials = await User.find({ role: 'official' });
      for (const official of officials) {
        const emailHtml = getNewRequestEmail(
          official.name,
          savedRequest.title,
          req.user.name,
          savedRequest.category,
          savedRequest.urgency
        );
        sendEmail(official.email, `New Request: ${savedRequest.title}`, emailHtml);
      }
    } catch (emailError) {
      console.error('Email notification failed:', emailError.message);
    }

    res.status(201).json({
      message: 'Request submitted successfully',
      request: savedRequest,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// GET /api/requests/my — Get all requests by logged-in user
router.get('/my', auth, async (req, res) => {
  try {
    const requests = await Request.find({ citizen: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests.' });
  }
});

// GET /api/requests/dashboard — Dashboard summary (officials only)
router.get('/dashboard', auth, roleCheck('official'), async (req, res) => {
  try {
    const total = await Request.countDocuments();
    const pending = await Request.countDocuments({ status: 'pending' });
    const inProgress = await Request.countDocuments({ status: 'in-progress' });
    const resolved = await Request.countDocuments({ status: 'resolved' });
    const rejected = await Request.countDocuments({ status: 'rejected' });

    const byCategory = await Request.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const recent = await Request.find()
      .populate('citizen', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      total,
      pending,
      inProgress,
      resolved,
      rejected,
      byCategory,
      recent,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard data.' });
  }
});

// GET /api/requests/:id — Get single request by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('citizen', 'name email')
      .populate('assignedTo', 'name email department');

    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    // Only citizen owner or official can view
    if (
      req.user.role !== 'official' &&
      request.citizen._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view this request.' });
    }

    res.json({ request });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch request.' });
  }
});

// GET /api/requests — Get all requests (officials only) with filters, sort & pagination
router.get('/', auth, roleCheck('official'), async (req, res) => {
  try {
    const { status, category, urgency, sort, search, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (urgency) filter.urgency = urgency;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'urgency-high') sortOption = { urgency: -1, createdAt: -1 };
    if (sort === 'urgency-low') sortOption = { urgency: 1, createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Request.countDocuments(filter);

    const requests = await Request.find(filter)
      .populate('citizen', 'name email')
      .populate('assignedTo', 'name email department')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests.' });
  }
});

// PATCH /api/requests/:id/status — Update request status (officials only)
router.patch('/:id/status', auth, roleCheck('official'), async (req, res) => {
  try {
    const { status, resolutionNote } = req.body;

    const validStatuses = ['pending', 'in-progress', 'resolved', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    const oldStatus = request.status;

    request.status = status;
    request.assignedTo = req.user._id;
    if (resolutionNote) {
      request.resolutionNote = resolutionNote;
    }

    const updatedRequest = await request.save();

    // Log activity
    await ActivityLog.create({
      request: request._id,
      performedBy: req.user._id,
      action: status === 'resolved' ? 'resolved' : status === 'rejected' ? 'rejected' : 'status-change',
      description: `changed status from "${oldStatus}" to "${status}"`,
      previousStatus: oldStatus,
      newStatus: status,
    });

    // Notify citizen
    await Notification.create({
      user: request.citizen,
      request: request._id,
      message: `Your request "${request.title}" status changed to ${status}`,
    });

    // Email notification to citizen
    try {
      const citizen = await User.findById(request.citizen);
      if (citizen) {
        const emailHtml = getStatusChangeEmail(
          citizen.name,
          request.title,
          oldStatus,
          status,
          resolutionNote || ''
        );
        sendEmail(citizen.email, `Request Updated: ${request.title}`, emailHtml);
      }
    } catch (emailError) {
      console.error('Email notification failed:', emailError.message);
    }

    res.json({
      message: 'Request status updated successfully',
      request: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update request status.' });
  }
});

module.exports = router;