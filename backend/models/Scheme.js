const mongoose = require("mongoose");

// Manager schema for embedded manager documents
const managerSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  employeeCode: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  position: { type: String, required: true, trim: true },
  hierarchyLevel: { type: Number, required: true, min: 1, max: 6 },
  divisionCode: { type: String, trim: true },
  costCenter: { type: String, trim: true },
  gradeLevel: { type: String, trim: true },
  allocationCount: { type: Number, default: 0, min: 0 },
  availableAllocation: { type: Number, default: 0, min: 0 },
  assignedCount: { type: Number, default: 0, min: 0 },
  assignedDate: { type: Date, default: Date.now },
  assignedBy: { type: String, trim: true }
}, { _id: false });

const schemeSchema = new mongoose.Schema(
  {
    schemeName: { type: String, required: true, trim: true },
    totalAllocation: { type: Number, required: true, min: 1 },
    onRequest: { type: String, enum: ["yes", "no"], required: true },
    recurring: { type: String, enum: ["yes", "no"], required: true },
    rotational: { type: String, enum: ["yes", "no"], required: true },
    perHeadAllowance: { type: Number, required: true, min: 0 },
    allowanceFrequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },
    description: { type: String, trim: true },
    minimumQualifications: { type: String, required: true, trim: true },
    schemeStartDate: { type: String, required: true },
    schemeEndDate: { type: String, required: true },

    // Fields to track allocation
    totalAllocatedCount: { type: Number, default: 0, min: 0 },
    totalEmptyCount: { type: Number, default: 0, min: 0 },

    // 6-Level Manager hierarchy
    level1Manager: managerSchema,  // Executive Level
    level2Manager: managerSchema,  // Senior Management
    level3Manager: managerSchema,  // Middle Management
    level4Manager: managerSchema,  // Team Leadership
    level5Manager: managerSchema,  // Supervisory Level
    level6Manager: managerSchema,  // Operational Level

    // Metadata
    isActive: { type: Boolean, default: true },
    lastRecalculated: { type: Date, default: Date.now }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for utilization percentage
schemeSchema.virtual('utilizationPercentage').get(function() {
  if (this.totalAllocation === 0) return 0;
  return Math.round((this.totalAllocatedCount / this.totalAllocation) * 100);
});

// Virtual for total manager allocation (6-level system)
schemeSchema.virtual('totalManagerAllocation').get(function() {
  return (this.level1Manager?.allocationCount || 0) +
         (this.level2Manager?.allocationCount || 0) +
         (this.level3Manager?.allocationCount || 0) +
         (this.level4Manager?.allocationCount || 0) +
         (this.level5Manager?.allocationCount || 0) +
         (this.level6Manager?.allocationCount || 0);
});

// Virtual for assigned managers count (6-level system)
schemeSchema.virtual('assignedManagersCount').get(function() {
  let count = 0;
  if (this.level1Manager?.employeeId) count++;
  if (this.level2Manager?.employeeId) count++;
  if (this.level3Manager?.employeeId) count++;
  if (this.level4Manager?.employeeId) count++;
  if (this.level5Manager?.employeeId) count++;
  if (this.level6Manager?.employeeId) count++;
  return count;
});

// Virtual for managers by level
schemeSchema.virtual('managersByLevel').get(function() {
  const managers = {};
  for (let i = 1; i <= 6; i++) {
    const levelKey = `level${i}Manager`;
    if (this[levelKey]?.employeeId) {
      managers[i] = this[levelKey];
    }
  }
  return managers;
});

// Pre-save middleware to calculate empty count and available allocations
schemeSchema.pre("save", function (next) {
  // Calculate total empty positions
  this.totalEmptyCount = Math.max(0, this.totalAllocation - this.totalAllocatedCount);

  // Calculate available allocation for each level manager
  for (let level = 1; level <= 6; level++) {
    const levelKey = `level${level}Manager`;
    
    if (this[levelKey] && this[levelKey].employeeId) {
      this[levelKey].availableAllocation = Math.max(
        0, 
        this[levelKey].allocationCount - this[levelKey].assignedCount
      );
    }
  }

  // Update last recalculated timestamp
  this.lastRecalculated = new Date();

  next();
});

// Pre-save validation
schemeSchema.pre("save", function (next) {
  // Validate that total manager allocation doesn't exceed scheme allocation
  const totalManagerAllocation = this.totalManagerAllocation;
  
  if (totalManagerAllocation > this.totalAllocation) {
    const error = new Error(
      `Total manager allocation (${totalManagerAllocation}) cannot exceed scheme total allocation (${this.totalAllocation})`
    );
    error.name = 'ValidationError';
    return next(error);
  }

  // Validate dates
  if (this.schemeStartDate && this.schemeEndDate) {
    const startDate = new Date(this.schemeStartDate);
    const endDate = new Date(this.schemeEndDate);
    
    if (startDate >= endDate) {
      const error = new Error('Scheme end date must be after start date');
      error.name = 'ValidationError';
      return next(error);
    }
  }

  // Validate hierarchy levels for managers
  for (let level = 1; level <= 6; level++) {
    const levelKey = `level${level}Manager`;
    
    if (this[levelKey] && this[levelKey].employeeId) {
      if (this[levelKey].hierarchyLevel !== level) {
        const error = new Error(
          `Manager assigned to ${levelKey} must have hierarchyLevel ${level}, but has ${this[levelKey].hierarchyLevel}`
        );
        error.name = 'ValidationError';
        return next(error);
      }
    }
  }

  next();
});

// Post-save middleware to log changes
schemeSchema.post('save', function(doc) {
  console.log(`Scheme ${doc.schemeName} (${doc._id}) saved successfully`);
  console.log(`Allocation status: ${doc.totalAllocatedCount}/${doc.totalAllocation} (${doc.utilizationPercentage}%)`);
  console.log(`Assigned managers: ${doc.assignedManagersCount}/6 levels`);
});

// Static methods
schemeSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

schemeSchema.statics.findByManager = function(employeeId) {
  return this.find({
    $or: [
      { 'level1Manager.employeeId': employeeId },
      { 'level2Manager.employeeId': employeeId },
      { 'level3Manager.employeeId': employeeId },
      { 'level4Manager.employeeId': employeeId },
      { 'level5Manager.employeeId': employeeId },
      { 'level6Manager.employeeId': employeeId }
    ]
  });
};

schemeSchema.statics.findByLevel = function(hierarchyLevel) {
  const levelKey = `level${hierarchyLevel}Manager`;
  const query = {};
  query[`${levelKey}.employeeId`] = { $exists: true };
  return this.find(query);
};

schemeSchema.statics.getSchemeStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalSchemes: { $sum: 1 },
        activeSchemes: { 
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } 
        },
        totalPositions: { $sum: '$totalAllocation' },
        allocatedPositions: { $sum: '$totalAllocatedCount' },
        availablePositions: { $sum: '$totalEmptyCount' },
        averageUtilization: { 
          $avg: { 
            $multiply: [
              { $divide: ['$totalAllocatedCount', '$totalAllocation'] },
              100
            ]
          }
        },
        // Count managers by level
        level1Managers: { 
          $sum: { $cond: [{ $ne: ['$level1Manager.employeeId', null] }, 1, 0] } 
        },
        level2Managers: { 
          $sum: { $cond: [{ $ne: ['$level2Manager.employeeId', null] }, 1, 0] } 
        },
        level3Managers: { 
          $sum: { $cond: [{ $ne: ['$level3Manager.employeeId', null] }, 1, 0] } 
        },
        level4Managers: { 
          $sum: { $cond: [{ $ne: ['$level4Manager.employeeId', null] }, 1, 0] } 
        },
        level5Managers: { 
          $sum: { $cond: [{ $ne: ['$level5Manager.employeeId', null] }, 1, 0] } 
        },
        level6Managers: { 
          $sum: { $cond: [{ $ne: ['$level6Manager.employeeId', null] }, 1, 0] } 
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalSchemes: 0,
    activeSchemes: 0,
    totalPositions: 0,
    allocatedPositions: 0,
    availablePositions: 0,
    averageUtilization: 0,
    level1Managers: 0,
    level2Managers: 0,
    level3Managers: 0,
    level4Managers: 0,
    level5Managers: 0,
    level6Managers: 0
  };
};

// Instance methods
schemeSchema.methods.canAssignManager = function(managerLevel, allocationCount) {
  const levelKey = `level${managerLevel}Manager`;
  const currentAllocation = this.totalManagerAllocation;
  const managerCurrentAllocation = this[levelKey]?.allocationCount || 0;
  const newTotalAllocation = currentAllocation - managerCurrentAllocation + allocationCount;
  
  return newTotalAllocation <= this.totalAllocation;
};

schemeSchema.methods.getManagerByEmployeeId = function(employeeId) {
  for (let level = 1; level <= 6; level++) {
    const levelKey = `level${level}Manager`;
    
    if (this[levelKey]?.employeeId === employeeId) {
      return { 
        type: levelKey, 
        level: level,
        data: this[levelKey] 
      };
    }
  }
  return null;
};

schemeSchema.methods.getManagerByLevel = function(hierarchyLevel) {
  const levelKey = `level${hierarchyLevel}Manager`;
  return this[levelKey] || null;
};

schemeSchema.methods.isEmployeeAlreadyAssigned = function(employeeId) {
  for (let level = 1; level <= 6; level++) {
    const levelKey = `level${level}Manager`;
    if (this[levelKey]?.employeeId === employeeId) {
      return true;
    }
  }
  return false;
};

schemeSchema.methods.getTotalManagerAllocation = function() {
  return this.totalManagerAllocation;
};

schemeSchema.methods.getAssignedLevels = function() {
  const assignedLevels = [];
  for (let level = 1; level <= 6; level++) {
    const levelKey = `level${level}Manager`;
    if (this[levelKey]?.employeeId) {
      assignedLevels.push({
        level: level,
        manager: this[levelKey]
      });
    }
  }
  return assignedLevels;
};

schemeSchema.methods.removeManagerByLevel = function(hierarchyLevel) {
  const levelKey = `level${hierarchyLevel}Manager`;
  this[levelKey] = undefined;
  return this;
};

// Indexes for better query performance (6-level system)
schemeSchema.index({ schemeName: 1 });
schemeSchema.index({ isActive: 1 });
schemeSchema.index({ schemeStartDate: 1, schemeEndDate: 1 });
schemeSchema.index({ createdAt: -1 });
schemeSchema.index({ lastRecalculated: -1 });

// Manager-specific indexes for efficient querying
schemeSchema.index({ 'level1Manager.employeeId': 1 });
schemeSchema.index({ 'level2Manager.employeeId': 1 });
schemeSchema.index({ 'level3Manager.employeeId': 1 });
schemeSchema.index({ 'level4Manager.employeeId': 1 });
schemeSchema.index({ 'level5Manager.employeeId': 1 });
schemeSchema.index({ 'level6Manager.employeeId': 1 });

// Compound indexes for complex queries
schemeSchema.index({ 
  'level1Manager.employeeId': 1, 
  'level1Manager.department': 1 
});
schemeSchema.index({ 
  'level2Manager.employeeId': 1, 
  'level2Manager.department': 1 
});
schemeSchema.index({ 
  'level3Manager.employeeId': 1, 
  'level3Manager.department': 1 
});
schemeSchema.index({ 
  'level4Manager.employeeId': 1, 
  'level4Manager.department': 1 
});
schemeSchema.index({ 
  'level5Manager.employeeId': 1, 
  'level5Manager.department': 1 
});
schemeSchema.index({ 
  'level6Manager.employeeId': 1, 
  'level6Manager.department': 1 
});

// Text search index for scheme names and descriptions
schemeSchema.index({ 
  schemeName: 'text', 
  description: 'text',
  minimumQualifications: 'text'
});

// Allocation tracking indexes
schemeSchema.index({ totalAllocation: 1, totalAllocatedCount: 1 });
schemeSchema.index({ totalEmptyCount: 1 });

// Export the model
module.exports = mongoose.model("Scheme", schemeSchema);