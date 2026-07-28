const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Request = require('../models/Request');
const auth = require('../middleware/auth');

// POST /api/feedback — Submit feedback
router.post('/', auth, async (req, res) => {
  try {
    const { requestId, rating, comment } = req.body;

    if (!requestId || !rating) {
      return res.status(400).json({ message: 'Request ID and rating are required.' });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    // Only the citizen who created the request can give feedback
    if (request.citizen.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the request owner can give feedback.' });
    }

    // Only allow feedback on resolved requests
    if (request.status !== 'resolved') {
      return res.status(400).json({ message: 'Feedback can only be given on resolved requests.' });
    }

    // Check if feedback already exists
    const existing = await Feedback.findOne({ request: requestId, citizen: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'Feedback already submitted. Use update instead.' });
    }

    const feedback = new Feedback({
      request: requestId,
      citizen: req.user._id,
      rating,
      comment: comment || '',
    });

    const saved = await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback: saved });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit feedback.' });
  }
});

// GET /api/feedback/:requestId — Get feedback for a request
router.get('/:requestId', auth, async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ request: req.params.requestId })
      .populate('citizen', 'name email');

    res.json({ feedback });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch feedback.' });
  }
});

// PATCH /api/feedback/:requestId — Update feedback
router.patch('/:requestId', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const feedback = await Feedback.findOne({
      request: req.params.requestId,
      citizen: req.user._id,
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found.' });
    }

    if (rating) feedback.rating = rating;
    if (comment !== undefined) feedback.comment = comment;

    const updated = await feedback.save();
    res.json({ message: 'Feedback updated successfully', feedback: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update feedback.' });
  }
});

// GET /api/feedback/user/all — Get all feedback by logged-in user
router.get('/user/all', auth, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ citizen: req.user._id })
      .populate('request', 'title status category')
      .sort({ createdAt: -1 });

    res.json({ feedbacks });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch feedback history.' });
  }
});

module.exports = router;