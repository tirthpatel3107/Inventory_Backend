import mongoose from "mongoose";

const HardwareSchema = new mongoose.Schema(
  {
    hardwareId: {
      type: String,
      unique: true,
      required: true,
    },
    hardwareName: {
      type: String,
      required: true,
    },
    svNo: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Unassign",
    },
    type: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      default: "Working",
    },
    employeesWithAccess: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "employees",
      },
    ],
    employeeHistory: [
      {
        employee: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "employees",
        },
        assignDate: {
          type: Date || null,
          default: null,
        },
        unassignDate: {
          type: Date || null,
          default: null,
        },
      },
    ],
    notes: {
      type: String,
    },
    date: {
      type: Date || null,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Hardware = mongoose.model("hardwares", HardwareSchema);
