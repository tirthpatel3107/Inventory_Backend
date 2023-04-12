import { asyncError } from "../middleware/errorMiddleware.js";
import ErrorHandler from "../middleware/errorHandler.js";
import {
  successHandler,
  successHandlerWithoutData,
} from "../middleware/successHandler.js";
import { Hardware } from "../models/hardwareModel.js";
import { Employee } from "../models/employeeModel.js";

// Creating Hardware
export const createHardware = asyncError(async (req, res, next) => {
  const {
    hardwareId,
    hardwareName,
    svNo,
    type,
    condition,
    date,
    status,
    notes,
  } = req.body;

  const id = await Hardware.findOne({ hardwareId });

  if (id) {
    return next(new ErrorHandler("Entered ID is already exists.", 400));
  }

  let newHardware = await Hardware.create({
    hardwareId,
    hardwareName,
    svNo,
    type,
    condition,
    date,
    status,
    notes,
  });

  successHandler("Hardware Created Successfully", 201, res, newHardware);
});

// Getting All Hardwares
export const getAllHardwares = asyncError(async (req, res, next) => {
  const ascendingOrder = { hardwareId: 1 };

  const hardwares = await Hardware.find({ isDeleted: false })
    .sort(ascendingOrder)
    .populate({
      path: "employeesWithAccess",
      select: "employeeName",
    });

  successHandler("Get All Hardwre Data Successfully", 200, res, hardwares);
});

// Getting Single Hardware
export const getHardware = asyncError(async (req, res, next) => {
  const hardware = await Hardware.findById(req.params.id)
    .populate({
      path: "employeesWithAccess",
      select: "employeeId employeeName department phone type status rm pm",
    })
    .populate({
      path: "employeeHistory.employee",
      select: "employeeId employeeName department phone status isDeleted",
    });

  if (!hardware) {
    return next(new ErrorHandler("Hardware Does not Found.", 404));
  }

  successHandler("Hardware Data is getting Successfully", 200, res, hardware);
});

// Updating Hardware
export const updateHardware = asyncError(async (req, res, next) => {
  const hardware = await Hardware.findById(req.params.id);

  if (!hardware) {
    return next(new ErrorHandler("Hardware Does Not Found", 404));
  }

  const { hardwareId } = req.body;

  const hardwareIdExist = await Hardware.findOne({
    hardwareId,
    _id: { $ne: req.params.id },
  });

  if (hardwareIdExist) {
    return next(new ErrorHandler("Hardware ID already Existed", 400));
  }

  const updatedHardware = await Hardware.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  successHandler("Hardware Updated Successfully", 200, res, updatedHardware);
});

// Aassign Hardware
export const hardwareAssign = asyncError(async (req, res, next) => {
  const { id } = req.params;
  const { emmployeeID } = req.body;

  const { status } = await Hardware.findById(id);

  if (status === "Assign") {
    return next(new ErrorHandler("Hardware is already Asssign", 404));
  }

  await Hardware.findByIdAndUpdate(id, {
    $set: { status: "Assign" },
    $push: {
      employeesWithAccess: emmployeeID,
      employeeHistory: {
        employee: emmployeeID,
        assignDate: new Date(),
      },
    },
  });

  await Employee.findByIdAndUpdate(emmployeeID, {
    $push: { assignHardwares: id },
  });

  successHandlerWithoutData("Hardware Id is Assign Successfully", 200, res);
});

// Unassign Hardware
export const hardwareUnassign = asyncError(async (req, res, next) => {
  const { id } = req.params;
  const { emmployeeID } = req.body;

  const { status } = await Hardware.findById(id);

  if (status === "Unassign") {
    return next(new ErrorHandler("Hardware is already Unasssign", 404));
  }

  await Hardware.findByIdAndUpdate(id, {
    $set: {
      status: "Unassign",
    },
    $pull: { employeesWithAccess: emmployeeID },
  });

  // For Unassign Hardware Date Purpose
  await Hardware.findOneAndUpdate(
    { _id: id, "employeeHistory.unassignDate": null },
    {
      $set: {
        "employeeHistory.$.unassignDate": new Date(),
      },
    }
  );

  await Employee.findByIdAndUpdate(emmployeeID, {
    $pull: { assignHardwares: id },
  });

  successHandlerWithoutData("Hardware Id is Unassign Successfully", 200, res);
});

// Get All Unassign Working Hardwares
export const unassignAllHardwares = asyncError(async (req, res, next) => {
  const data = await Hardware.find({
    status: "Unassign",
    condition: "Working",
    isDeleted: false,
  });

  const result = await data
    .map((value) => {
      return {
        ObjectId: value._id,
        hardwareId: value.hardwareId,
        hardwareName: value.hardwareName,
      };
    })
    .sort((a, b) => {
      if (a.hardwareId < b.hardwareId) {
        return -1;
      }
      if (a.hardwareId > b.hardwareId) {
        return 1;
      }
      return 0;
    });

  successHandler(
    "Get All Unassigned Hardwre Data Successfully",
    200,
    res,
    result
  );
});

// Deleting Hardware
export const softDeleteHardware = asyncError(async (req, res, next) => {
  const hardwareId = req.params.id;

  const hardware = await Hardware.findById(req.params.id);

  if (!hardware) {
    return next(new ErrorHandler("Hardware Does Not Found", 404));
  }

  await Hardware.findByIdAndUpdate(hardwareId, {
    $set: {
      isDeleted: true,
      status: "Unassign",
    },
  });

  // For Hardware Unassign Date Add purpose
  await Hardware.findOneAndUpdate(
    { _id: hardwareId, "employeeHistory.unassignDate": null },
    {
      $set: {
        "employeeHistory.$.unassignDate": new Date(),
      },
    }
  );

  if (hardware.employeesWithAccess.length > 0) {
    const employeeID = hardware.employeesWithAccess[0].toHexString();

    await Employee.findByIdAndUpdate(employeeID, {
      $pull: { assignHardwares: hardwareId },
    });
  }

  successHandlerWithoutData("Hardware is successfully Deleted.", 200, res);
});

// Employees Dashbaord Information
export const dashbaordInfo = asyncError(async (req, res, next) => {
  const totalHardware = await Hardware.countDocuments({ isDeleted: false });

  const assignHardware = await Hardware.countDocuments({
    isDeleted: false,
    status: "Assign",
  });

  const inStockHardware = await Hardware.countDocuments({
    isDeleted: false,
    status: "Unassign",
    condition: "Working",
  });

  const damageHardware = await Hardware.countDocuments({
    isDeleted: false,
    condition: "Damaged",
  });

  const typeWiseCount = await Hardware.aggregate([
    {
      $match: {
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: "$type",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  const inStockWiseCount = await Hardware.aggregate([
    {
      $match: {
        isDeleted: false,
        status: "Unassign",
        condition: "Working",
      },
    },
    {
      $group: {
        _id: "$type",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  const result = {
    totalHardware,
    assignHardware,
    inStockHardware,
    damageHardware,
    typeWiseCount,
    inStockWiseCount,
  };

  successHandler("Get All Hardware Summary", 200, res, result);
});
