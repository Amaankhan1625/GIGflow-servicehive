const express = require('express');
const Gig = require('../models/Gig');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all open gigs with search
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = { status: 'open' };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const gigs = await Gig.find(query).populate('ownerId', 'name email').sort({ createdAt: -1 });
    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's own gigs
router.get('/user', auth, async (req, res) => {
  try {
    const gigs = await Gig.find({ ownerId: req.user.userId }).populate('ownerId', 'name email').sort({ createdAt: -1 });
    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single gig details
router.get('/:id', async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate('ownerId', 'name email');
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    res.json(gig);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new gig
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    const gig = new Gig({
      title,
      description,
      budget,
      ownerId: req.user.userId
    });

    await gig.save();
    await gig.populate('ownerId', 'name email');

    // Emit real-time event for new gig
    const io = require('../server').io;
    io.emit('newGig', gig);

    res.status(201).json(gig);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a gig (owner only, only if status is open)
router.put('/:id', auth, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'Cannot edit gig that is not open' });
    }

    const { title, description, budget } = req.body;
    gig.title = title || gig.title;
    gig.description = description || gig.description;
    gig.budget = budget || gig.budget;

    await gig.save();
    await gig.populate('ownerId', 'name email');

    res.json(gig);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a gig (owner only, only if status is open)
router.delete('/:id', auth, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'Cannot delete gig that is not open' });
    }

    // Delete all bids for this gig
    await require('../models/Bid').deleteMany({ gigId: req.params.id });

    await gig.deleteOne();
    res.json({ message: 'Gig deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
