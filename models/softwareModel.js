import mongoose from "mongoose";

const SoftwareSchema = new mongoose.Schema(
  {
    softwareId: {
      type: String,
      unique: true,
      required: true,
    },
    softwareName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },
    notes: {
      type: String,
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Software = mongoose.model("softwares", SoftwareSchema);
