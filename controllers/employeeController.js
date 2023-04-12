import { asyncError } from "../middleware/errorMiddleware.js";
import ErrorHandler from "../middleware/errorHandler.js";
import {
  successHandler,
  successHandlerWithoutData,
} from "../middleware/successHandler.js";
import { Employee } from "../models/employeeModel.js";
import { Hardware } from "../models/hardwareModel.js";
import { Software } from "../models/softwareModel.js";

// Creating Employee
export const createEmployee = asyncError(async (req, res, next) => {
  const { employeeId, employeeName, department, phone, type, status, rm, pm } =
    req.body;

  const id = await Employee.findOne({ employeeId });

  if (id) {
    return next(new ErrorHandler("Entered ID is already exists.", 400));
  }

  const name = await Employee.findOne({ employeeName });

  if (name) {
    return next(new ErrorHandler("Entered Name is already exists.", 400));
  }

  const newEmployee = await Employee.create({
    employeeId,
    employeeName,
    department,
    phone,
    type,
    status,
    rm,
    pm,
  });

  successHandler("Employee Created Successfully", 201, res, newEmployee);
});

// Getting All Employees
export const getAllEmployees = asyncError(async (req, res, next) => {
  const ascendingOrder = { employeeId: 1 };

  const employees = await Employee.find({ isDeleted: false }).sort(
    ascendingOrder
  );

  successHandler("Get All Employees Data Successfully", 200, res, employees);
});

// Getting Single Employee
export const getEmployee = asyncError(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id)
    .populate({
      path: "assignHardwares",
      select: "hardwareId hardwareName svNo type",
    })
    .populate({
      path: "assignSoftwares",
      select: "softwareId softwareName userName password",
    });

  if (!employee) {
    return next(new ErrorHandler("Employee Does not Found", 404));
  }

  successHandler("Employee Data is getting Successfully", 200, res, employee);
});

// Updating Employee
export const updateEmployee = asyncError(async (req, res, next) => {
  const { employeeId, employeeName } = req.body;

  const emp = await Employee.findById(req.params.id);

  if (!emp) {
    return next(new ErrorHandler("Employee Does Not Found", 404));
  }

  // Updating Logic
  const employeeIdOrNameExists = await Employee.findOne({
    $or: [{ employeeId }, { employeeName }],
    _id: { $ne: req.params.id },
  });

  if (employeeIdOrNameExists) {
    return next(new ErrorHandler("Employee ID or Name already Existed", 404));
  }

  const updatedEmployee = await Employee.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  if (emp.employeeName !== employeeName) {
    // Change all Reporting Manager Name if Employee Name is changed
    await Employee.updateMany(
      { rm: emp.employeeName },
      { $set: { rm: employeeName } }
    );

    // Change all Project Manager Name if Employee Name is changed
    await Employee.updateMany(
      { pm: emp.employeeName },
      { $set: { pm: employeeName } }
    );
  }

  successHandler("Employee Updated Successfully", 200, res, updatedEmployee);
});

// Getting Employees List
export const employeesList = asyncError(async (req, res, next) => {
  const data = await Employee.find({ isDeleted: false });

  const result = data
    .map((val) => {
      return {
        e_id: val._id,
        name: val.employeeName,
      };
    })
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });

  successHandler("Get All Employees List Successfully", 200, res, result);
});

// Getting all emplpoyees list By ID
export const employeesListById = asyncError(async (req, res, next) => {
  const openEmployeeId = req.params.id;

  const data = await Employee.find({ isDeleted: false });

  const result = data
    .filter((value) => value._id != openEmployeeId)
    .map((single) => {
      return {
        e_id: single._id,
        name: single.employeeName,
      };
    })
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });

  successHandler("Get All Employees List Successfully", 200, res, result);
});

// Deleting Employee
export const softDeleteEmployee = asyncError(async (req, res, next) => {
  const employeeId = req.params.id;

  const employee = await Employee.findById(employeeId);

  if (!employee) {
    return next(new ErrorHandler("Employee does Not Found", 404));
  }

  const { employeeName, assignHardwares, assignSoftwares } = employee;

  const empAssignHardwares = assignHardwares.map(String);
  const empAssignSoftwares = assignSoftwares.map(String);

  await Employee.findByIdAndUpdate(employeeId, {
    $set: {
      isDeleted: true,
      status: "Inactive",
    },
  });

  await Employee.updateMany({ rm: employeeName }, { $set: { rm: "" } });
  await Employee.updateMany({ pm: employeeName }, { $set: { pm: "" } });

  // await Hardware.updateMany(
  //   { _id: { $in: empAssignHardwares } },
  //   { $set: { employeesWithAccess: [], status: "Unassign" } },
  //   { multi: true }
  // );

  // await Software.updateMany(
  //   { _id: { $in: empAssignSoftwares } },
  //   { $set: { employeesWithAccess: [], status: "Unassign" } },
  //   { multi: true }
  // );

  await Hardware.updateMany(
    { _id: { $in: empAssignHardwares } },
    { $set: { status: "Pending" } },
    { multi: true }
  );

  await Software.updateMany(
    { _id: { $in: empAssignSoftwares } },
    { $set: { status: "Pending" } },
    { multi: true }
  );

  successHandlerWithoutData("Employee is successfully Deleted.", 200, res);
});

// Employees Dashbaord Information
export const dashbaordInfo = asyncError(async (req, res, next) => {
  const totalEmployee = await Employee.countDocuments({ isDeleted: false });

  const wfhEmployee = await Employee.countDocuments({
    isDeleted: false,
    type: "WFH",
  });

  const wfoEmployee = await Employee.countDocuments({
    isDeleted: false,
    type: "WFO",
  });

  const department = await Employee.aggregate([
    {
      $match: {
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: "$department",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  const result = {
    totalEmployee,
    wfhEmployee,
    wfoEmployee,
    department,
  };

  successHandler("Get All Employee Summary", 200, res, result);
});
