import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
    },
    employeeName: {
      type: String,
      required: [true, "Employee Name is required"],
      unique: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
    },
    phone: {
      type: String,
    },
    type: {
      type: String,
      default: "WFH",
    },
    status: {
      type: String,
      default: "Active",
    },
    rm: {
      type: String,
    },
    pm: {
      type: String,
    },
    assignHardwares: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "hardwares",
      },
    ],
    assignSoftwares: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "softwares",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Employee = mongoose.model("employees", EmployeeSchema);
