import { asyncError } from "../middleware/errorMiddleware.js";
import ErrorHandler from "../middleware/errorHandler.js";
import {
  successHandler,
  successHandlerWithoutData,
} from "../middleware/successHandler.js";
import { Software } from "../models/softwareModel.js";
import { Employee } from "../models/employeeModel.js";

// Creating Software
export const createSoftware = asyncError(async (req, res, next) => {
  const { softwareId, softwareName, userName, password, status, notes } =
    req.body;

  const id = await Software.findOne({ softwareId });

  if (id) {
    return next(new ErrorHandler("Entered ID is already exists.", 400));
  }

  let newSoftware = await Software.create({
    softwareId,
    softwareName,
    userName,
    password,
    status,
    notes,
  });

  successHandler("Software Created Successfully", 201, res, newSoftware);
});

// Getting All Softwares
export const getAllSoftwares = asyncError(async (req, res, next) => {
  const ascendingOrder = { softwareId: 1 };

  const softwares = await Software.find({ isDeleted: false })
    .sort(ascendingOrder)
    .populate({
      path: "employeesWithAccess",
      select: "employeeName",
    });

  successHandler("Get All Software Data Successfully", 200, res, softwares);
});

// Getting Single Software
export const getSoftware = asyncError(async (req, res, next) => {
  const software = await Software.findById(req.params.id)
    .populate({
      path: "employeesWithAccess",
      select: "employeeId employeeName department phone type status rm pm",
    })
    .populate({
      path: "employeeHistory.employee",
      select: "employeeId employeeName department phone status isDeleted",
    });

  if (!software) {
    return next(new ErrorHandler("Software Does not Found.", 404));
  }

  successHandler("Software Data is getting Successfully", 200, res, software);
});

// Updating Software
export const updateSoftware = asyncError(async (req, res, next) => {
  const software = await Software.findById(req.params.id);

  if (!software) {
    return next(new ErrorHandler("Software Does Not Found", 404));
  }

  const { softwareId } = req.body;

  const softwareIdExists = await Software.findOne({
    softwareId,
    _id: { $ne: req.params.id },
  });

  if (softwareIdExists) {
    return next(new ErrorHandler("Software ID already Existed", 400));
  }

  const updatedSoftware = await Software.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  successHandler("Software Updated Successfully", 200, res, updatedSoftware);
});

// Aassign Software
export const softwareAssign = asyncError(async (req, res, next) => {
  const { id } = req.params;
  const { emmployeeID } = req.body;

  const { status } = await Software.findById(id);

  if (status === "Assign") {
    return next(new ErrorHandler("Software is already Asssign", 404));
  }

  await Software.findByIdAndUpdate(id, {
    $set: { status: "Assign" },
    $push: {
      employeesWithAccess: emmployeeID,
      employeeHistory: { employee: emmployeeID, assignDate: new Date() },
    },
  });

  await Employee.findByIdAndUpdate(emmployeeID, {
    $push: { assignSoftwares: id },
  });

  successHandlerWithoutData("Software Id is Assign Successfully", 200, res);
});

// Unassign Software
export const softwareUnassign = asyncError(async (req, res, next) => {
  const { id } = req.params;
  const { emmployeeID } = req.body;

  const { status } = await Software.findById(id);

  if (status === "Unassign") {
    return next(new ErrorHandler("Software is already Unasssign", 404));
  }

  await Software.findByIdAndUpdate(id, {
    $set: { status: "Unassign" },
    $pull: { employeesWithAccess: emmployeeID },
  });

  // For Unassign Software Date Purpose
  await Software.findOneAndUpdate(
    { _id: id, "employeeHistory.unassignDate": null },
    {
      $set: {
        "employeeHistory.$.unassignDate": new Date(),
      },
    }
  );

  await Employee.findByIdAndUpdate(emmployeeID, {
    $pull: { assignSoftwares: id },
  });

  successHandlerWithoutData("Software Id is Unassign Successfully", 200, res);
});

// Get All Unassign Softwares
export const unassignSoftwareIds = asyncError(async (req, res, next) => {
  const data = await Software.find({ status: "Unassign", isDeleted: false });

  const result = await data
    .map((value) => {
      return {
        ObjectId: value._id,
        softwareId: value.softwareId,
        softwareName: value.softwareName,
      };
    })
    .sort((a, b) => {
      if (a.softwareId < b.softwareId) {
        return -1;
      }
      if (a.softwareId > b.softwareId) {
        return 1;
      }
      return 0;
    });

  successHandler(
    "Get All Unassigned Software Data Successfully",
    200,
    res,
    result
  );
});

// Deleting Software
export const softDeleteSoftware = asyncError(async (req, res, next) => {
  const softwareId = req.params.id;

  const software = await Software.findById(softwareId);

  if (!software) {
    return next(new ErrorHandler("Software Does Not Found", 404));
  }

  await Software.findByIdAndUpdate(softwareId, {
    $set: {
      isDeleted: true,
      status: "Unassign",
    },
  });

  // For Software Unassign Date Add purpose
  await Software.findOneAndUpdate(
    { _id: softwareId, "employeeHistory.unassignDate": null },
    {
      $set: {
        "employeeHistory.$.unassignDate": new Date(),
      },
    }
  );

  if (software.employeesWithAccess.length > 0) {
    const employeeID = software.employeesWithAccess[0].toHexString();

    await Employee.findByIdAndUpdate(employeeID, {
      $pull: { assignSoftwares: softwareId },
    });
  }

  successHandlerWithoutData("Software is successfully Deleted.", 200, res);
});
