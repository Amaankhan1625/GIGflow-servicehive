const express = require('express');
const mongoose = require('mongoose');
const Bid = require('../models/Bid');
const Gig = require('../models/Gig');
const auth = require('../middleware/auth');

module.exports = (io) => {
  const router = express.Router();

// Get user's own bids
router.get('/user', auth, async (req, res) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user.userId })
      .populate('gigId', 'title description budget status')
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }

});

// Submit a bid
router.post('/', auth, async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    // Check if gig exists and is open
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'Gig is not open for bidding' });
    }

    // Check if user already bid on this gig
    const existingBid = await Bid.findOne({ gigId, freelancerId: req.user.userId });
    if (existingBid) {
      return res.status(400).json({ message: 'You have already bid on this gig' });
    }

    const bid = new Bid({
      gigId,
      freelancerId: req.user.userId,
      message,
      price
    });

    await bid.save();
    await bid.populate('freelancerId', 'name email');

    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bids for a gig (owner only)
router.get('/:gigId', auth, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const bids = await Bid.find({ gigId: req.params.gigId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Hire a freelancer (atomic operation)
router.patch('/:bidId/hire', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bid = await Bid.findById(req.params.bidId).session(session);
    if (!bid) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Bid not found' });
    }

    const gig = await Gig.findById(bid.gigId).session(session);
    if (!gig) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Check if user owns the gig
    if (gig.ownerId.toString() !== req.user.userId) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if gig is still open
    if (gig.status !== 'open') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Gig is not open' });
    }

    // Update gig status to assigned
    gig.status = 'assigned';
    await gig.save({ session });

    // Update hired bid status
    bid.status = 'hired';
    await bid.save({ session });

    // Update all other bids for this gig to rejected
    await Bid.updateMany(
      { gigId: bid.gigId, _id: { $ne: bid._id } },
      { status: 'rejected' },
      { session }
    );

    await session.commitTransaction();

    // Emit real-time notification to the hired freelancer
    io.emit('freelancerHired', {
      freelancerId: bid.freelancerId.toString(),
      gigTitle: gig.title,
      message: `You have been hired for "${gig.title}"!`
    });

    res.json({ message: 'Freelancer hired successfully', bid });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession();
  }
});

// Update bid (freelancer only, only if status is pending)
router.put('/:id', auth, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.freelancerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot edit bid that is not pending' });
    }

    const { message, price } = req.body;
    bid.message = message || bid.message;
    bid.price = price || bid.price;

    await bid.save();
    await bid.populate('freelancerId', 'name email');

    res.json(bid);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete bid (freelancer only, only if status is pending)
router.delete('/:id', auth, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.freelancerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete bid that is not pending' });
    }

    await bid.deleteOne();
    res.json({ message: 'Bid deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

return router;
};
