const Draft = require('../models/Draft');

// @desc    Save or update a complaint draft
// @route   POST /api/drafts
// @access  Private (Citizen)
exports.saveDraft = async (req, res, next) => {
  try {
    const { draftId, title, description, category, priority, location, images } = req.body;
    const userId = req.user.id;

    let draft;
    if (draftId) {
      draft = await Draft.findOne({ _id: draftId, userId });
    }

    if (!draft) {
      // Find latest draft or create new
      draft = await Draft.findOne({ userId }).sort({ updatedAt: -1 });
    }

    if (draft) {
      draft.title = title !== undefined ? title : draft.title;
      draft.description = description !== undefined ? description : draft.description;
      draft.category = category !== undefined ? category : draft.category;
      draft.priority = priority !== undefined ? priority : draft.priority;
      if (location) draft.location = location;
      if (images) draft.images = images;
      draft.lastSavedAt = new Date();
      await draft.save();
    } else {
      draft = await Draft.create({
        userId,
        title: title || '',
        description: description || '',
        category: category || 'Other',
        priority: priority || 'MEDIUM',
        location: location || { address: '', lat: 30.7333, lng: 76.7794 },
        images: images || [],
        lastSavedAt: new Date()
      });
    }

    res.status(200).json({
      success: true,
      data: draft,
      message: 'Draft saved successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's active drafts
// @route   GET /api/drafts
// @access  Private (Citizen)
exports.getDrafts = async (req, res, next) => {
  try {
    const drafts = await Draft.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      count: drafts.length,
      data: drafts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single draft by ID
// @route   GET /api/drafts/:id
// @access  Private (Citizen)
exports.getDraftById = async (req, res, next) => {
  try {
    const draft = await Draft.findOne({ _id: req.params.id, userId: req.user.id });
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }
    res.status(200).json({ success: true, data: draft });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a draft
// @route   DELETE /api/drafts/:id
// @access  Private (Citizen)
exports.deleteDraft = async (req, res, next) => {
  try {
    const draft = await Draft.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }
    res.status(200).json({ success: true, message: 'Draft deleted successfully' });
  } catch (err) {
    next(err);
  }
};
