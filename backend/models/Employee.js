const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  employee_code: { 
    type: String, 
    required: [true, 'Employee code is required'], 
    unique: true,  
    trim: true
  },
  full_name: { 
    type: String, 
    required: [true, 'Full name is required'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  department: { 
    type: String, 
    required: [true, 'Department is required'],
    trim: true
  },
  job_title: { 
    type: String, 
    required: [true, 'Job title is required'],
    trim: true
  },
  hierarchy_level: { 
    type: Number, 
    required: [true, 'Hierarchy level is required'],
    min: [1, 'Hierarchy level must be at least 1']
  },
  division_code: { 
    type: String, 
    required: [true, 'Division code is required'],
    trim: true
  },
  cost_center: { 
    type: String, 
    required: [true, 'Cost center is required'],
    trim: true
  },
  grade_level: { 
    type: String, 
    required: [true, 'Grade level is required'],
    trim: true
  },
  status: { 
    type: String, 
    enum: {
      values: ['active', 'inactive', 'terminated'],
      message: 'Status must be active, inactive, or terminated'
    },
    default: 'active'
  },
  joining_date: { 
    type: Date, 
    required: [true, 'Joining date is required']
  },
  subordinates: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  last_updated: {
    type: Date,
    default: Date.now
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

employeeSchema.index({ department: 1, status: 1 }); 
employeeSchema.index({ hierarchy_level: 1 });

// Text index for search functionality
employeeSchema.index({ 
  full_name: 'text', 
  employee_code: 'text', 
  email: 'text', 
  job_title: 'text' 
});

// Middleware to update last_updated field
employeeSchema.pre('save', function(next) {
  this.last_updated = new Date();
  next();
});

employeeSchema.pre('findOneAndUpdate', function(next) {
  this.set({ last_updated: new Date() });
  next();
});

// Virtual to get subordinate count
employeeSchema.virtual('subordinate_count').get(function() {
  return this.subordinates ? this.subordinates.length : 0;
});

// Ensure virtuals are included in JSON output
employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

// method to work with ObjectId
employeeSchema.methods.getHierarchyPath = async function() {
  const path = [];
  let currentManagerId = this.reporting_manager_id;

  return path;
};

// static method to work with ObjectId
employeeSchema.statics.updateSubordinates = async function(managerId) {
  if (!managerId) return;
  
  try {
    const subordinates = await this.find({ 
      reporting_manager_id: managerId,
      status: { $in: ['active', 'inactive'] }
    }).select('_id').lean();
    
    await this.findOneAndUpdate(
      { _id: managerId },
      { subordinates: subordinates.map(sub => sub._id) }
    );
  } catch (error) {
    console.error('Error updating subordinates:', error);
  }
};

// method to work with ObjectId
employeeSchema.statics.validateHierarchy = async function(employeeId, newManagerId) {
  return true;
};

const Employee = mongoose.model("Employee", employeeSchema);
module.exports = Employee;