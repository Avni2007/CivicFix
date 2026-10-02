const Municipality = require('../models/Municipality');
const User = require('../models/User');

/**
 * Get all 36 Government-Verified Municipal Local Bodies of India
 */
exports.getAllMunicipalities = async (req, res, next) => {
  try {
    const { state, search } = req.query;
    const filter = { isActive: true };

    if (state) {
      filter.state = new RegExp(`^${state.trim()}$`, 'i');
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { state: new RegExp(search, 'i') },
        { code: new RegExp(search, 'i') },
        { lgdCode: new RegExp(search, 'i') }
      ];
    }

    const municipalities = await Municipality.find(filter).sort({ state: 1 });
    res.status(200).json({
      success: true,
      count: municipalities.length,
      data: municipalities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Specific Municipality by State Name or Code
 */
exports.getMunicipalityByState = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const municipality = await Municipality.findOne({
      $or: [
        { state: new RegExp(`^${identifier.trim()}$`, 'i') },
        { code: identifier.trim().toUpperCase() },
        { city: new RegExp(`^${identifier.trim()}$`, 'i') }
      ]
    });

    if (!municipality) {
      return res.status(404).json({ success: false, message: `Municipality not found for "${identifier}"` });
    }

    // Also fetch official verified staff associated with this municipality
    const staff = await User.find({
      $or: [
        { state: municipality.state },
        { municipalityCode: municipality.code }
      ],
      role: { $in: ['authority', 'admin'] }
    }).select('-passwordHash');

    res.status(200).json({
      success: true,
      data: municipality,
      verifiedStaff: staff
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Government-Verified Municipal Staff
 */
exports.getVerifiedStaff = async (req, res, next) => {
  try {
    const { state, department, role } = req.query;
    const filter = {
      role: { $in: ['authority', 'admin'] },
      governmentIdVerified: true
    };

    if (state) filter.state = new RegExp(state, 'i');
    if (department) filter.department = department;
    if (role) filter.role = role;

    const staff = await User.find(filter).select('-passwordHash').sort({ state: 1, role: 1 });

    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff
    });
  } catch (error) {
    next(error);
  }
};
