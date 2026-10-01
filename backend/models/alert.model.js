import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
      index: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ["stress", "drought", "decline", "patchy", "no_data"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "warning",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    observedAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

alertSchema.index({ farmId: 1, resolvedAt: 1 });
alertSchema.index({ orgId: 1, resolvedAt: 1, createdAt: -1 });

const Alert = mongoose.model("Alert", alertSchema);
export default Alert;
