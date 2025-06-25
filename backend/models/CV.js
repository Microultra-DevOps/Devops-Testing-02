const mongoose = require("mongoose");

const cvSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: { type: String, required: true },
    nameWithInitials: { type: String, required: true },
    gender: { type: String, required: true },
    postalAddress: { type: String, required: true },
    referredBy: { type: String },
    userType: { type: String, required: true },
    district: { type: String, required: true },
    birthday: { type: String, required: true },
    nic: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    landPhone: { type: String },
    emailAddress: { type: String, required: true },
    institute: { type: String, required: true },
    selectedRole: {
      type: String,
      required: true,
      enum: ["dataEntry", "internship"],
    },

    // Role-specific data
    roleData: {
      // Data Entry Operator specific fields
      dataEntry: {
      language: { type: String },
      mathematics: { type: String },
      science: { type: String },
      english: { type: String },
      history: { type: String },
      religion: { type: String },
      optional1Name: { type: String },
      optional1Result: { type: String },
      optional2Name: { type: String },
      optional2Result: { type: String },
      optional3Name: { type: String },
      optional3Result: { type: String },
      aLevelSubject1Name: { type: String },
      aLevelSubject1Result: { type: String },
      aLevelSubject2Name: { type: String },
      aLevelSubject2Result: { type: String },
      aLevelSubject3Name: { type: String },
      aLevelSubject3Result: { type: String },
      preferredLocation: { type: String },
      otherQualifications: { type: String },
    },

      // Internship specific fields
      internship: {
        categoryOfApply: { type: String },
        higherEducation: { type: String },
        otherQualifications: { type: String },
      },
    },

    emergencyContactName1: { type: String, required: true },
    emergencyContactNumber1: { type: String, required: true },
    emergencyContactName2: { type: String },
    emergencyContactNumber2: { type: String },
    previousTraining: { type: String, required: true },
    updatedCv: { type: String },
    nicFile: { type: String },
    policeClearanceReport: { type: String },
    internshipRequestLetter: { type: String },

    refNo: { type: String, unique: true },
    applicationDate: { type: Date, default: Date.now },
    createdByAdmin: {
      type: Boolean,
      default: false,
    },
    
    // Soft Delete Implementation
    isDeleted: { type: Boolean, default: false },
    deletionInfo: {
      deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      deletedDate: { type: Date },
      adminName: { type: String },
      employeeId: { type: String },
      deletionReason: { type: String },
      deletionComments: { type: String },
    },
    
    // CV Approval Status
    cvApproval: {
      cvApproved: { type: Boolean, default: false },
      status: {
        type: String,
        enum: ["cv-submitted", "cv-pending", "cv-approved", "cv-rejected"],
        default: "cv-submitted",
      },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      approvedDate: { type: Date },
      rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rejectedDate: { type: Date },
      notes: { type: String },
    },

// Interview Details
interview: {
  interviewScheduled: { type: Boolean, default: false },
  status: {
    type: String,
    enum: [
      "interview-not-scheduled",
      "interview-scheduled",
      "interview-completed",
      "interview-failed",
      "interview-re-scheduled",  
      "interview-no-show",
      "interview-skipped",
      "interview-passed"
    ],
    default: "interview-not-scheduled",
  },
  interviews: [
    {
      interviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interview",
      },
      interviewName: { type: String },
      interviewDate: { type: String },
      interviewTime: { type: String },
      location: { type: String },
      rescheduleCount: { type: Number, default: 0 },  
      rescheduleHistory: [
        {
          previousDate: { type: String },
          previousTime: { type: String },
          previousLocation: { type: String },
          rescheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          rescheduledDate: { type: Date },
          notes: { type: String }
        }
      ],
      result: {
        status: {
          type: String,
          enum: [
            "interview-passed",
            "interview-failed",
            "interview-pending",
          ],
        },
        evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        evaluatedDate: { type: Date },
        feedback: { type: String },
      },
    },
  ],
},

  // Induction Details
induction: {
  inductionAssigned: { type: Boolean, default: false },
  status: {
    type: String,
    enum: [
      "induction-not-scheduled",
      "induction-scheduled", 
      "induction-assigned",
      "induction-re-scheduled",
      "induction-completed",
      "induction-passed",
      "induction-failed"
    ],
    default: "induction-not-scheduled",
  },
  inductionId: { type: mongoose.Schema.Types.ObjectId, ref: "Induction" },
  inductionName: { type: String },
  inductionStartDate: { type: String },
  inductionEndDate: { type: String },
  inductionLocation: { type: String },
  rescheduleCount: { type: Number, default: 0 },
  rescheduleHistory: [
    {
      // Previous induction details
      previousInductionId: { type: mongoose.Schema.Types.ObjectId, ref: "Induction" },
      previousInductionName: { type: String },
      previousStartDate: { type: String },
      previousEndDate: { type: String },
      previousLocation: { type: String },
      
      // New induction details
      newInductionId: { type: mongoose.Schema.Types.ObjectId, ref: "Induction" },
      newInductionName: { type: String },
      newStartDate: { type: String },
      newEndDate: { type: String },
      newLocation: { type: String },
      
      // Reschedule metadata
      rescheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rescheduledDate: { type: Date, default: Date.now },
      reason: { type: String, required: true }
    }
  ],
  result: {
    status: {
      type: String,
      enum: ["induction-passed", "induction-failed", "induction-pending"],
      default: "induction-pending"
    },
    evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    evaluatedDate: { type: Date },
    feedback: { type: String },
  },
},

    // Schema Assignment
   schemaAssignment: {
  schemaAssigned: { type: Boolean, default: false },
  status: {
    type: String,
    enum: [
      "schema-not-assigned",
      "schema-assigned",
      "schema-completed",
      "terminated",
    ],
    default: "schema-not-assigned",
  },
  schemeId: { type: mongoose.Schema.Types.ObjectId, ref: "Scheme" },
  schemeName: { type: String, trim: true },
  
  // Manager Information
  managerId: { type: String, trim: true }, 
  managerName: { type: String, trim: true },
  managerRole: { type: String, trim: true }, 
  managerLevel: { type: Number, min: 1, max: 6 }, 
  managerEmployeeCode: { type: String, trim: true },
  managerEmail: { type: String, trim: true },
  managerDepartment: { type: String, trim: true },
  managerPosition: { type: String, trim: true },
  
  // Assignment Details
  internshipPeriod: { type: Number, min: 1 }, 
  startDate: { type: Date },
  endDate: { type: Date },
  forRequest: { type: String, enum: ["yes", "no"], default: "no" },
  
  // Assignment Metadata
  assignedDate: { type: Date, default: Date.now },
  assignedBy: { type: String, trim: true }, // Employee ID of who made the assignment
  lastModified: { type: Date, default: Date.now },
  modifiedBy: { type: String, trim: true },
  
  // Scheme Details (cached for performance)
  schemeType: {
    onRequest: { type: String, enum: ["yes", "no"] },
    recurring: { type: String, enum: ["yes", "no"] },
    rotational: { type: String, enum: ["yes", "no"] },
  },
  perHeadAllowance: { type: Number, min: 0 },
  allowanceFrequency: {
    type: String,
    enum: ["daily", "weekly", "monthly"],
  },
  
  // Progress Tracking
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  milestones: [{
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    dueDate: { type: Date },
    completedDate: { type: Date },
    status: { 
      type: String, 
      enum: ["pending", "in-progress", "completed", "overdue"],
      default: "pending"
    },
    completedBy: { type: String, trim: true }
  }],
  
  // Evaluation System
  evaluation: {
    status: {
      type: String,
      enum: ["satisfactory", "unsatisfactory", "pending", "in-progress"],
      default: "pending",
    },
    evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    evaluatedDate: { type: Date },
    feedback: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5 }, 
    evaluationDetails: {
      technicalSkills: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      teamwork: { type: Number, min: 1, max: 5 },
      punctuality: { type: Number, min: 1, max: 5 },
      initiative: { type: Number, min: 1, max: 5 },
      overallPerformance: { type: Number, min: 1, max: 5 }
    },
    recommendations: { type: String, trim: true },
    improvementAreas: [{ type: String, trim: true }],
    strengths: [{ type: String, trim: true }],
  },
  
  // Extension/Termination Details
  extensionRequests: [{
    requestedBy: { type: String, trim: true },
    requestDate: { type: Date, default: Date.now },
    requestedPeriod: { type: Number, min: 1 }, // Additional months
    reason: { type: String, required: true, trim: true },
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    approvedBy: { type: String, trim: true },
    approvalDate: { type: Date },
    remarks: { type: String, trim: true }
  }],
  
  terminationDetails: {
    terminatedDate: { type: Date },
    terminatedBy: { type: String, trim: true },
    terminationReason: { 
      type: String,
      enum: [
        "completion",
        "early-termination-performance",
        "early-termination-conduct",
        "mutual-agreement",
        "personal-reasons",
        "other"
      ]
    },
    terminationRemarks: { type: String, trim: true },
    finalEvaluation: {
      completed: { type: Boolean, default: false },
      rating: { type: Number, min: 1, max: 5 },
      feedback: { type: String, trim: true }
    }
  },
  
  // Completion Certificate
  completionCertificate: {
    issued: { type: Boolean, default: false },
    issuedDate: { type: Date },
    issuedBy: { type: String, trim: true },
    certificateNumber: { type: String, trim: true },
    remarks: { type: String, trim: true }
  }
},

    // Overall CV Status
    currentStatus: {
  type: String,
  enum: [
    "draft",
    "cv-submitted",
    "cv-approved",
    "cv-rejected",
    "interview-scheduled",
    "interview-re-scheduled",
    "interview-passed",
    "interview-failed",
    "induction-scheduled",
    "induction-re-scheduled", 
    "induction-passed",
    "induction-failed",
    "induction-assigned", 
    "schema-assigned",
    "schema-completed",
    "terminated",
  ],
  default: "draft",
},

    // Tracking
    applicationDate: { type: Date, default: Date.now },
    lastUpdated: { type: Date },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Rotational
    rotationalAssignment: {
      isRotational: { type: Boolean, default: false },
      status: {
        type: String,
        enum: [
          "station-not-assigned",
          "station-assigned",
          "rotational-completed",
          "terminated",
        ],
        default: "station-not-assigned",
      },
      assignedStations: [
        {
          station: { type: mongoose.Schema.Types.ObjectId, ref: "Station" },
          startDate: { type: Date },
          endDate: { type: Date },
          serviceTimePeriod: { type: Number }, 
          isCurrent: { type: Boolean, default: false },
        },
      ],
      internshipDuration: { type: Number, default: 24 }, 
    },
  },
  { timestamps: true }
);

// Generate unique reference number and update status before saving
cvSchema.pre("save", function (next) {
  // Generate refNo if not set
  if (!this.refNo) {
    this.refNo = `REF-${this._id.toString().slice(-6).toUpperCase()}`;
  }

  // Update lastUpdated timestamp
  this.lastUpdated = new Date();

  // Only update currentStatus if flag is not set
  if (!this._skipStatusUpdate && (
    this.isModified("cvApproval.status") ||
    this.isModified("interview.status") ||
    this.isModified("induction.status") ||
    this.isModified("schemaAssignment.status")
  )) {
    this.updateCurrentStatus();
  }

  // Reset the flag to ensure future saves work normally
  this._skipStatusUpdate = false;

  next();
});

// Method to update currentStatus based on other statuses
cvSchema.methods.updateCurrentStatus = function () {
    // First check CV rejection (highest priority)
    if (this.cvApproval.status === "cv-rejected") {
      this.currentStatus = "cv-rejected";
      return;
    }

    // Check schema assignment status
    if (this.schemaAssignment.status === "schema-assigned") {
      this.currentStatus = "schema-assigned";
      return;
    } else if (this.schemaAssignment.status === "schema-completed") {
      this.currentStatus = "schema-completed";
      return;
    } else if (this.schemaAssignment.status === "terminated") {
      this.currentStatus = "terminated";
      return;
    }

    // Check induction status - handle all induction statuses including re-scheduled
    if (this.induction.status === "induction-re-scheduled") {
      this.currentStatus = "induction-re-scheduled";
      return;
    } else if (this.induction.status === "induction-assigned") {
      this.currentStatus = "induction-assigned";
      return;
    } else if (this.induction.result?.status === "induction-passed") {
      this.currentStatus = "induction-passed";
      return;
    } else if (this.induction.result?.status === "induction-failed") {
      this.currentStatus = "induction-failed";
      return;
    }

    // Check interview status
    if (this.interview.status === "interview-re-scheduled") {
      this.currentStatus = "interview-re-scheduled";
      return;
    } else if (this.interview.status === "interview-scheduled") {
      this.currentStatus = "interview-scheduled";
      return;
    } else if (this.interview.status === "interview-completed" || 
               this.interview.interviews?.some(
                 (i) => i.result?.status === "interview-passed"
               )) {
      this.currentStatus = "interview-passed";
      return;
    } else if (this.interview.status === "interview-failed" ||
               this.interview.interviews?.some(
                 (i) => i.result?.status === "interview-failed"
               )) {
      this.currentStatus = "interview-failed";
      return;
    }

    // Check CV approval status
    if (this.cvApproval.status === "cv-approved") {
      this.currentStatus = "cv-approved";
      return;
    } else if (this.cvApproval.status === "cv-submitted") {
      this.currentStatus = "cv-submitted";
      return;
    }

    // Default fallback
    this.currentStatus = "draft";
  };

// Method to perform soft delete
cvSchema.methods.softDelete = function(adminInfo) {
  if (this.isDeleted) {
    throw new Error('CV is already deleted');
  }
  
  this.isDeleted = true;
  this.deletionInfo = {
    deletedBy: adminInfo.deletedBy,
    deletedDate: new Date(),
    adminName: adminInfo.adminName,
    employeeId: adminInfo.employeeId,
    deletionReason: adminInfo.deletionReason,
    deletionComments: adminInfo.deletionComments,
  };
  return this.save();
};

// Method to restore soft deleted CV
cvSchema.methods.restore = function() {
  if (!this.isDeleted) {
    throw new Error('CV is not deleted, cannot restore');
  }
  
  this.isDeleted = false;
  this.deletionInfo = undefined;
  return this.save();
};

// Query middleware to exclude soft deleted documents by default
cvSchema.pre(/^find/, function() {
  const options = this.getOptions();
  
  // Only exclude deleted documents if not explicitly including them
  if (!options.includeDeleted) {
    const currentQuery = this.getQuery();
    
    // Only add the exclusion if isDeleted is not already specified in query
    if (!currentQuery.hasOwnProperty('isDeleted')) {
      this.where({ isDeleted: { $ne: true } });
    }
  }
});

// Static method to find deleted CVs
cvSchema.statics.findDeleted = function(options = {}) {
  return this.find({ isDeleted: true }).setOptions({ includeDeleted: true });
};

cvSchema.statics.findActive = function() {
  return this.find({ isDeleted: { $ne: true } });
};

cvSchema.statics.countDeleted = function() {
  return this.countDocuments({ isDeleted: true }).setOptions({ includeDeleted: true });
};

cvSchema.statics.countActive = function() {
  return this.countDocuments({ isDeleted: { $ne: true } });
};

// Add indexes
// Role-Specific Indexes
cvSchema.index({ "roleData.internship.categoryOfApply": 1 }); 
cvSchema.index({ "roleData.dataEntry.preferredLocation": 1 }); 

// Combined Role + Status Index (Optimizes admin dashboards)
cvSchema.index({ selectedRole: 1, "cvApproval.status": 1 });

// Text Index for Search (Name/NIC)
cvSchema.index({ fullName: "text", nic: "text" });

// Unique NIC Index (Prevent duplicates) - only for non-deleted documents
cvSchema.index({ nic: 1, isDeleted: 1 }, { unique: true });

// Soft delete indexes
cvSchema.index({ isDeleted: 1 });
cvSchema.index({ "deletionInfo.deletedDate": 1 });

module.exports = mongoose.model("CV", cvSchema);