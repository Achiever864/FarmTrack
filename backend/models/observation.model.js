import mongoose from "mongoose";

const observationSchema = new mongoose.Schema(
  {
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
      index: true,
    },
    obsDate: {
      type: Date,
      required: true,
    },
    ndviMean: {
      type: Number,
      default: null,
    },
    ndviStd: {
      type: Number,
      default: null,
    },
    ndviMin: {
      type: Number,
      default: null,
    },
    ndviMax: {
      type: Number,
      default: null,
    },
    ndreMean: {
      type: Number,
      default: null,
    },
    ndmiMean: {
      type: Number,
      default: null,
    },
    validPixels: {
      type: Number,
      required: true,
    },
    totalPixels: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Compound unique index ensuring idempotency on upsert
observationSchema.index({ farmId: 1, obsDate: 1 }, { unique: true });
observationSchema.index({ farmId: 1, obsDate: -1 });

const Observation = mongoose.model("Observation", observationSchema);
export default Observation;
