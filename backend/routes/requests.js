const express = require('express');
const router = express.Router();

const Request = require('../models/Request');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

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
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'official') {
      return res.status(403).json({ message: 'Access denied. Officials only.' });
    }

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

// Update request status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, resolutionNote } = req.body;

    const allowedStatuses = [
      'Pending',
      'In Progress',
      'Resolved',
      'Rejected',
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status value',
      });
    }

    const request = await Request.findById(req.params.id)
      .populate('citizen', 'name email')
      .populate('assignedTo', 'name email');

    if (!request) {
      return res.status(404).json({
        message: 'Request not found',
      });
    }

    const previousStatus = request.status;

    request.status = status;

    if (resolutionNote !== undefined) {
      request.resolutionNote = resolutionNote;
    }

    await request.save();

    // Activity log create
    await ActivityLog.create({
      request: request._id,
      performedBy: req.user.id,
      action: 'Status Updated',
      description: `Request status changed from ${previousStatus} to ${status}`,
      previousStatus,
      newStatus: status,
    });

    // Citizen notification create
    await Notification.create({
      user: request.citizen._id,
      request: request._id,
      message: `Your request "${request.title}" status has been updated to ${status}.`,
    });

    const updatedRequest = await Request.findById(request._id)
      .populate('citizen', 'name email')
      .populate('assignedTo', 'name email');

    res.status(200).json({
      message: 'Request status updated successfully',
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Status update error:', error);

    res.status(500).json({
      message: 'Failed to update request status',
      error: error.message,
    });
  }
});