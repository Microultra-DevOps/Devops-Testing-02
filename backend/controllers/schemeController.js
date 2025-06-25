const Scheme = require('../models/Scheme');
const Intern = require('../models/Intern');

// Create a new scheme
exports.createScheme = async (req, res) => {
  try {
    const schemeData = {
      ...req.body,
      totalAllocatedCount: 0,
      totalEmptyCount: req.body.totalAllocation
    };
    
    const newScheme = new Scheme(schemeData);
    await newScheme.save();
    res.status(201).json({ 
      success: true,
      message: 'Scheme created successfully', 
      data: newScheme 
    });
  } catch (err) {
    console.error('Create scheme error:', err);
    res.status(400).json({ 
      success: false,
      error: 'Failed to create scheme', 
      message: err.message 
    });
  }
};

// Get all schemes
exports.getAllSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: schemes,
      count: schemes.length
    });
  } catch (error) {
    console.error('Get all schemes error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch schemes', 
      message: error.message 
    });
  }
};

// Get a scheme by ID
exports.getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ 
        success: false,
        error: 'Scheme not found',
        message: `No scheme found with ID: ${req.params.id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: scheme
    });
  } catch (error) {
    console.error('Get scheme by ID error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch scheme', 
      message: error.message 
    });
  }
};

// Update a scheme
exports.updateScheme = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // If totalAllocation has changed, recalculate totalEmptyCount
    if (updateData.totalAllocation !== undefined) {
      const scheme = await Scheme.findById(id);
      if (!scheme) {
        return res.status(404).json({ 
          success: false,
          error: 'Scheme not found',
          message: `No scheme found with ID: ${id}`
        });
      }
      
      updateData.totalEmptyCount = updateData.totalAllocation - scheme.totalAllocatedCount;
    }
    
    const updatedScheme = await Scheme.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!updatedScheme) {
      return res.status(404).json({ 
        success: false,
        error: 'Scheme not found',
        message: `No scheme found with ID: ${id}`
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: 'Scheme updated successfully', 
      data: updatedScheme 
    });
  } catch (error) {
    console.error('Update scheme error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update scheme', 
      message: error.message 
    });
  }
};

// Delete a scheme
exports.deleteScheme = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if there are any interns assigned to this scheme
    const internCount = await Intern.countDocuments({ schemeId: id });
    if (internCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete scheme',
        message: `Cannot delete scheme with ${internCount} assigned interns. Please reassign or remove interns first.`
      });
    }
    
    const scheme = await Scheme.findByIdAndDelete(id);
    if (!scheme) {
      return res.status(404).json({ 
        success: false,
        error: 'Scheme not found',
        message: `No scheme found with ID: ${id}`
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: 'Scheme deleted successfully',
      data: { deletedScheme: scheme }
    });
  } catch (error) {
    console.error('Delete scheme error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete scheme', 
      message: error.message 
    });
  }
};

// Assign managers to a scheme with full employee details (6-level hierarchy)
exports.assignManagers = async (req, res) => {
  try {
    const { id } = req.params;
    const managerData = req.body;
    
    console.log('Received 6-level manager assignment data:', JSON.stringify(managerData, null, 2));
    
    const scheme = await Scheme.findById(id);
    if (!scheme) {
      return res.status(404).json({ 
        success: false,
        error: 'Scheme not found',
        message: `No scheme found with ID: ${id}`
      });
    }

    // Helper function to process manager data for any level
    const processManagerData = (managerInfo) => {
      if (!managerInfo || !managerInfo.id) return null;
      
      return {
        employeeId: managerInfo.id,
        name: managerInfo.name,
        employeeCode: managerInfo.employeeCode,
        email: managerInfo.email,
        department: managerInfo.department,
        position: managerInfo.position,
        hierarchyLevel: managerInfo.hierarchyLevel,
        divisionCode: managerInfo.divisionCode,
        costCenter: managerInfo.costCenter,
        gradeLevel: managerInfo.gradeLevel,
        allocationCount: parseInt(managerInfo.allocationCount) || 0,
        availableAllocation: parseInt(managerInfo.allocationCount) || 0,
        assignedCount: 0, 
        assignedDate: managerData.assignedDate || new Date().toISOString(),
        assignedBy: managerData.assignedBy || 'system'
      };
    };

    // Process each level manager (1-6)
    const assignedManagers = [];
    
    for (let level = 1; level <= 6; level++) {
      const levelKey = `level${level}Manager`;
      
      if (managerData[levelKey]) {
        const managerInfo = processManagerData(managerData[levelKey]);
        if (managerInfo) {
          scheme[levelKey] = managerInfo;
          assignedManagers.push({
            level: level,
            name: managerInfo.name,
            allocation: managerInfo.allocationCount
          });
          console.log(`Assigned Level ${level} Manager:`, managerInfo.name);
        }
      }
    }

    // Validate total allocation doesn't exceed scheme allocation
    const totalManagerAllocation = scheme.getTotalManagerAllocation();

    if (totalManagerAllocation > scheme.totalAllocation) {
      return res.status(400).json({
        success: false,
        error: 'Allocation exceeded',
        message: `Total manager allocation (${totalManagerAllocation}) exceeds scheme total allocation (${scheme.totalAllocation})`
      });
    }

    await scheme.save();
    
    // Recalculate allocations after saving
    await recalculateSchemeAllocation(id);
    
    // Fetch updated scheme
    const updatedScheme = await Scheme.findById(id);
    
    res.status(200).json({ 
      success: true,
      message: `Successfully assigned ${assignedManagers.length} managers across ${assignedManagers.length} levels`, 
      data: updatedScheme,
      assignedManagers: assignedManagers
    });
    
  } catch (error) {
    console.error('Assign managers error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to assign managers', 
      message: error.message 
    });
  }
};

// Helper function to recalculate scheme allocation for 6-level system
const recalculateSchemeAllocation = async (schemeId) => {
  try {
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) return;

    // Count all interns assigned to this scheme
    const allocatedCount = await Intern.countDocuments({ schemeId: schemeId });
    
    // Count interns assigned to each manager level
    const levelCounts = {};
    
    for (let level = 1; level <= 6; level++) {
      const managerType = `level${level}Manager`;
      
      levelCounts[level] = await Intern.countDocuments({ 
        schemeId: schemeId, 
        managerType: managerType
      });
    }
    
    console.log(`Recalculation for scheme ${schemeId}:`, {
      total: allocatedCount,
      levelBreakdown: levelCounts
    });
    
    // Update scheme counts
    scheme.totalAllocatedCount = allocatedCount;
    scheme.totalEmptyCount = scheme.totalAllocation - allocatedCount;
    
    // Update manager assigned counts for each level
    for (let level = 1; level <= 6; level++) {
      const levelKey = `level${level}Manager`;
      
      if (scheme[levelKey] && scheme[levelKey].employeeId) {
        scheme[levelKey].assignedCount = levelCounts[level] || 0;
        scheme[levelKey].availableAllocation = 
          Math.max(0, scheme[levelKey].allocationCount - (levelCounts[level] || 0));
      }
    }
    
    await scheme.save();
    return scheme;
    
  } catch (error) {
    console.error('Recalculation error:', error);
    throw error;
  }
};

// Recalculate allocation endpoint
exports.recalculateAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedScheme = await recalculateSchemeAllocation(id);
    
    if (!updatedScheme) {
      return res.status(404).json({
        success: false,
        error: 'Scheme not found',
        message: `No scheme found with ID: ${id}`
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: 'Allocation counts recalculated successfully', 
      data: updatedScheme
    });
    
  } catch (error) {
    console.error('Recalculation endpoint error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to recalculate allocation counts', 
      message: error.message 
    });
  }
};

// Get manager details for a scheme (6-level system)
exports.getSchemeManagers = async (req, res) => {
  try {
    const { id } = req.params;
    
    const scheme = await Scheme.findById(id);
    if (!scheme) {
      return res.status(404).json({
        success: false,
        error: 'Scheme not found',
        message: `No scheme found with ID: ${id}`
      });
    }
    
    const managers = {
      level1Manager: scheme.level1Manager,
      level2Manager: scheme.level2Manager,
      level3Manager: scheme.level3Manager,
      level4Manager: scheme.level4Manager,
      level5Manager: scheme.level5Manager,
      level6Manager: scheme.level6Manager,
      schemeDetails: {
        schemeName: scheme.schemeName,
        totalAllocation: scheme.totalAllocation,
        totalAllocatedCount: scheme.totalAllocatedCount,
        totalEmptyCount: scheme.totalEmptyCount
      }
    };
    
    res.status(200).json({
      success: true,
      data: managers
    });
    
  } catch (error) {
    console.error('Get scheme managers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scheme managers',
      message: error.message
    });
  }
};

// Remove a manager from a scheme (6-level system)
exports.removeManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerType } = req.body;
    
    const validManagerTypes = [
      'level1Manager', 'level2Manager', 'level3Manager',
      'level4Manager', 'level5Manager', 'level6Manager'
    ];
    
    if (!validManagerTypes.includes(managerType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid manager type',
        message: 'Manager type must be one of: ' + validManagerTypes.join(', ')
      });
    }
    
    const scheme = await Scheme.findById(id);
    if (!scheme) {
      return res.status(404).json({
        success: false,
        error: 'Scheme not found',
        message: `No scheme found with ID: ${id}`
      });
    }
    
    // Check if there are interns assigned to this manager
    const assignedInterns = await Intern.countDocuments({
      schemeId: id,
      managerType: managerType
    });
    
    if (assignedInterns > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot remove manager',
        message: `Cannot remove manager with ${assignedInterns} assigned interns. Please reassign interns first.`
      });
    }
    
    // Remove the manager
    scheme[managerType] = undefined;
    await scheme.save();
    
    res.status(200).json({
      success: true,
      message: `${managerType} removed successfully`,
      data: scheme
    });
    
  } catch (error) {
    console.error('Remove manager error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove manager',
      message: error.message
    });
  }
};

// Get scheme statistics (6-level system)
exports.getSchemeStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const scheme = await Scheme.findById(id);
    if (!scheme) {
      return res.status(404).json({
        success: false,
        error: 'Scheme not found',
        message: `No scheme found with ID: ${id}`
      });
    }
    
    // Get detailed intern statistics for 6-level system
    const internStats = await Intern.aggregate([
      { $match: { schemeId: id } },
      {
        $group: {
          _id: '$managerType',
          count: { $sum: 1 },
          interns: { $push: { name: '$name', email: '$email', assignedDate: '$assignedDate' } }
        }
      }
    ]);
    
    const stats = {
      scheme: {
        id: scheme._id,
        name: scheme.schemeName,
        totalAllocation: scheme.totalAllocation,
        totalAllocatedCount: scheme.totalAllocatedCount,
        totalEmptyCount: scheme.totalEmptyCount,
        utilizationPercentage: Math.round((scheme.totalAllocatedCount / scheme.totalAllocation) * 100)
      },
      managers: {
        level1Manager: scheme.level1Manager,
        level2Manager: scheme.level2Manager,
        level3Manager: scheme.level3Manager,
        level4Manager: scheme.level4Manager,
        level5Manager: scheme.level5Manager,
        level6Manager: scheme.level6Manager
      },
      internDistribution: internStats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          interns: stat.interns
        };
        return acc;
      }, {}),
      summary: {
        totalManagers: [
          scheme.level1Manager, scheme.level2Manager, scheme.level3Manager,
          scheme.level4Manager, scheme.level5Manager, scheme.level6Manager
        ].filter(Boolean).length,
        totalAllocatedPositions: scheme.totalAllocatedCount,
        remainingPositions: scheme.totalEmptyCount,
        allocationComplete: scheme.totalAllocatedCount === scheme.totalAllocation
      }
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Get scheme stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scheme statistics',
      message: error.message
    });
  }
};