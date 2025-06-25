const Employee = require("../models/Employee");
const xlsx = require('xlsx');
const fs = require('fs');


// Get all employees with optional filtering and sorting (no pagination)
exports.getAllEmployees = async (req, res) => {
  try {
    const {
      department,
      division_code,
      hierarchy_level,
      status = 'active',
      search,
      sort_by = 'hierarchy_level',
      sort_order = 'asc'
    } = req.query;

    // Build filter object
    const filter = { status };

    if (department && department.trim() !== '') {
      filter.department = department.trim();
    }

    if (division_code && division_code.trim() !== '') {
      filter.division_code = division_code.trim();
    }

    if (hierarchy_level) {
      const level = parseInt(hierarchy_level);
      if (isNaN(level) || level < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid hierarchy level"
        });
      }
      filter.hierarchy_level = level;
    }

    // Search functionality
    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      filter.$or = [
        { full_name: { $regex: searchTerm, $options: 'i' } },
        { employee_code: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { job_title: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Build sort object
    const validSortFields = [
      'hierarchy_level',
      'full_name',
      'employee_code',
      'department',
      'job_title',
      'created_at'
    ];
    const sortField = sort_by === 'name' ? 'full_name' : sort_by;

    if (!validSortFields.includes(sortField)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sort field"
      });
    }

    const sortObj = {
      [sortField]: sort_order === 'desc' ? -1 : 1
    };
    if (sortField !== 'hierarchy_level') {
      sortObj.hierarchy_level = 1; 
    }

    console.log('Employee filter:', filter);
    console.log('Employee sort:', sortObj);

    // Fetch all matching employees
    const employees = await Employee.find(filter)
      .sort(sortObj)
      .lean();

    console.log(`Found ${employees.length} employees`);

    // Log hierarchy level distribution for debugging
    const levelDistribution = {};
    employees.forEach(emp => {
      const level = emp.hierarchy_level;
      levelDistribution[level] = (levelDistribution[level] || 0) + 1;
    });
    console.log('Level distribution:', levelDistribution);

    // Add additional computed fields for frontend compatibility
    const enhancedEmployees = employees.map(emp => ({
      ...emp,
      id: emp._id.toString(), 
      name: emp.full_name,
      employeeCode: emp.employee_code,
      position: emp.job_title,
      hierarchyLevel: emp.hierarchy_level,
      divisionCode: emp.division_code,
      costCenter: emp.cost_center,
      gradeLevel: emp.grade_level
    }));

    res.status(200).json({
      success: true,
      data: enhancedEmployees,
      total_records: employees.length,
      level_distribution: levelDistribution,
      debug: {
        filter_applied: filter,
        sort_applied: sortObj
      }
    });
  } catch (error) {
    console.error('Error in getAllEmployees:', error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // Get subordinates from the subordinates array
    const subordinates = await Employee.find({
      _id: { $in: employee.subordinates },
      status: { $in: ['active', 'inactive'] }
    })
      .select('_id full_name job_title employee_code hierarchy_level')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...employee.toObject(),
        subordinates
      }
    });
  } catch (error) {
    console.error('Error in getEmployeeById:', error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// Get organization hierarchy
exports.getOrganizationHierarchy = async (req, res) => {
  try {
    const { department, max_levels } = req.query;

    const filter = { status: 'active' };
    if (department) filter.department = department;
    
    // Parse max_levels for later use in tree building
    const maxLevel = max_levels ? parseInt(max_levels) : null;
    
    console.log('Hierarchy filter:', filter);

    const employees = await Employee.find(filter)
      .sort({ hierarchy_level: 1, full_name: 1 })
      .lean();

    console.log(`Found ${employees.length} employees`);
        
    // Log hierarchy level distribution
    const levelDistribution = {};
    employees.forEach(emp => {
      const level = emp.hierarchy_level;
      levelDistribution[level] = (levelDistribution[level] || 0) + 1;
    });
    console.log('Level distribution:', levelDistribution);

    // Build hierarchy with max_levels constraint
    const hierarchy = buildHierarchyTree(employees, maxLevel);

    console.log(`Built hierarchy with ${hierarchy.length} root nodes`);

    res.status(200).json({
      success: true,
      data: hierarchy,
      total_employees: employees.length,
      department: department || 'All Departments',
      max_levels: maxLevel,
      level_distribution: levelDistribution,
      debug: {
        root_nodes: hierarchy.length
      }
    });
  } catch (error) {
    console.error('Error in getOrganizationHierarchy:', error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const existing = await Employee.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // Remove uneditable fields
    delete updateData._id;
    delete updateData.created_at;
    delete updateData.subordinates; // Subordinates are managed separately

    // Validate required fields
    const required = [
      'employee_code', 'full_name', 'email',
      'department', 'job_title', 'hierarchy_level',
      'division_code', 'cost_center', 'grade_level'
    ];
    for (const field of required) {
      if (updateData[field] !== undefined &&
          (!updateData[field] || updateData[field].toString().trim() === '')
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} is required and cannot be empty`
        });
      }
    }

    // Validate hierarchy_level
    if (updateData.hierarchy_level !== undefined) {
      const lvl = parseInt(updateData.hierarchy_level);
      if (isNaN(lvl) || lvl < 1) {
        return res.status(400).json({
          success: false,
          message: "Hierarchy level must be a positive number"
        });
      }
      updateData.hierarchy_level = lvl;
    }

    // Validate status
    if (updateData.status &&
        !['active','inactive','terminated'].includes(updateData.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Status must be one of: active, inactive, terminated"
      });
    }

    // Unique constraints
    if (updateData.employee_code || updateData.email) {
      const dupQuery = { _id: { $ne: id } };
      if (updateData.employee_code) dupQuery.employee_code = updateData.employee_code.trim();
      if (updateData.email) {
        dupQuery.email = updateData.email.toLowerCase().trim();
        updateData.email = updateData.email.toLowerCase().trim();
      }
      const dup = await Employee.findOne(dupQuery);
      if (dup) {
        const fld = dup.employee_code === updateData.employee_code
          ? 'Employee code' : 'Email';
        return res.status(400).json({
          success: false,
          message: `${fld} already exists`
        });
      }
    }

    const updated = await Employee.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    const subs = await Employee.find({
      _id: { $in: updated.subordinates },
      status: { $in: ['active','inactive'] }
    })
    .select('_id full_name job_title employee_code hierarchy_level')
    .lean();

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: {
        ...updated.toObject(),
        subordinates: subs
      }
    });
  } catch (error) {
    console.error('Error in updateEmployee:', error);
    if (error.name === 'ValidationError') {
      const errs = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errs
      });
    }
    if (error.code === 11000) {
      const fld = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${fld} already exists`
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// Helper to build hierarchy tree based on subordinates array
function buildHierarchyTree(employees, maxLevel = null) {
  const map = new Map();
  const roots = [];
  
  // Filter employees by max level if specified
  let filteredEmployees = employees;
  if (maxLevel) {
    const minLevel = Math.min(...employees.map(emp => emp.hierarchy_level));
    filteredEmployees = employees.filter(emp => 
      emp.hierarchy_level <= minLevel + maxLevel - 1
    );
  }
  
  // First pass: create all nodes with children array
  filteredEmployees.forEach(emp => {
    map.set(emp._id.toString(), { 
      ...emp, 
      children: [],
      id: emp._id.toString() // Ensure id is string for frontend
    });
  });
  
  // Second pass: build relationships using subordinates array
  filteredEmployees.forEach(emp => {
    const node = map.get(emp._id.toString());
    
    // Add children based on subordinates array
    if (emp.subordinates && emp.subordinates.length > 0) {
      emp.subordinates.forEach(subordinateId => {
        const subordinate = map.get(subordinateId.toString());
        if (subordinate) {
          node.children.push(subordinate);
        }
      });
    }
  });
  
  // Third pass: identify root nodes (employees who are not subordinates of anyone)
  const subordinateIds = new Set();
  filteredEmployees.forEach(emp => {
    if (emp.subordinates && emp.subordinates.length > 0) {
      emp.subordinates.forEach(id => subordinateIds.add(id.toString()));
    }
  });
  
  // Root nodes are those not found in any subordinates array
  filteredEmployees.forEach(emp => {
    if (!subordinateIds.has(emp._id.toString())) {
      roots.push(map.get(emp._id.toString()));
    }
  });
  
  return roots;
}


// Add single employee
exports.addEmployee = async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json({ message: 'Employee added successfully', employee });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Upload employees via Excel
exports.uploadEmployees = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const validatedData = data.map((emp, index) => {
      // Validate required fields
      const requiredFields = ['employee_code', 'full_name', 'email', 'department', 'job_title', 'hierarchy_level', 'division_code', 'cost_center', 'grade_level', 'joining_date'];
      const missingFields = requiredFields.filter(field => !emp[field]);

      if (missingFields.length > 0) {
        throw new Error(`Row ${index + 2} is missing required fields: ${missingFields.join(', ')}`);
      }

      return {
        employee_code: emp.employee_code,
        full_name: emp.full_name,
        email: emp.email,
        department: emp.department,
        job_title: emp.job_title,
        hierarchy_level: emp.hierarchy_level,
        division_code: emp.division_code,
        cost_center: emp.cost_center,
        grade_level: emp.grade_level,
        joining_date: new Date(emp.joining_date), // Ensure valid date
        status: emp.status || 'active'
      };
    });

    const employees = await Employee.insertMany(validatedData);
    fs.unlinkSync(req.file.path);

    res.status(201).json({ message: 'Employees uploaded successfully', employees });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(400).json({ error: err.message });
  }
};

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Employee not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Employee not found' });
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};