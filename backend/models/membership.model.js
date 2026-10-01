import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "manager", "viewer"],
      default: "viewer",
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["invited", "active"],
      default: "active",
    },
  },
  { timestamps: true }
);

membershipSchema.index({ orgId: 1, userId: 1 }, { unique: true });

const Membership = mongoose.model("Membership", membershipSchema);
export default Membership;
