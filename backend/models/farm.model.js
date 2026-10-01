import mongoose from "mongoose";

const farmSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ownerType: {
      type: String,
      enum: ["user", "organization"],
      required: true,
      default: "user",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.ownerType === "user";
      },
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },
    geometry: {
      type: {
        type: String,
        enum: ["Polygon"],
        required: true,
        default: "Polygon",
      },
      coordinates: {
        type: [[[Number]]],
        required: true,
      },
    },
    areaHa: {
      type: Number,
      required: true,
    },
    centroid: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    cropType: {
      type: String,
      enum: ["cocoa", "coffee", "oil_palm", "rubber", "cashew", "other"],
      default: "cocoa",
      required: true,
    },
    plantingDate: {
      type: Date,
      default: null,
    },
    treeAgeYears: {
      type: Number,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    farmerName: {
      type: String,
      trim: true,
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
    backfillStatus: {
      type: String,
      enum: ["pending", "running", "done", "failed"],
      default: "pending",
    },
    latestHealth: {
      status: {
        type: String,
        enum: ["healthy", "watch", "at_risk", "insufficient_data"],
        default: "insufficient_data",
      },
      score: {
        type: Number,
        default: null,
      },
      confidence: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "low",
      },
      reasons: {
        type: [String],
        default: [],
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  { timestamps: true }
);

farmSchema.index({ geometry: "2dsphere" });
farmSchema.index({ orgId: 1, createdAt: -1 });
farmSchema.index({ ownerId: 1 });
farmSchema.index({ tags: 1 });

const Farm = mongoose.model("Farm", farmSchema);
export default Farm;
