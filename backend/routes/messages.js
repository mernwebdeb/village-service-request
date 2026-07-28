const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Request = require('../models/Request');
const auth = require('../middleware/auth');

// POST /api/messages — Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { requestId, text } = req.body;

    if (!requestId || !text || !text.trim()) {
      return res.status(400).json({ message: 'Request ID and message text are required.' });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    // Only citizen owner or official can send messages
    if (
      req.user.role !== 'official' &&
      request.citizen.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to message on this request.' });
    }

    const message = new Message({
      request: requestId,
      sender: req.user._id,
      text: text.trim(),
    });

    const savedMessage = await message.save();
    const populated = await savedMessage.populate('sender', 'name email role');

    res.status(201).json({
      message: 'Message sent successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message.' });
  }
});

// GET /api/messages/:requestId — Get all messages for a request
router.get('/:requestId', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    // Only citizen owner or official can view messages
    if (
      req.user.role !== 'official' &&
      request.citizen.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view these messages.' });
    }

    const messages = await Message.find({ request: req.params.requestId })
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages.' });
  }
});

module.exports = router;