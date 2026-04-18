import mongoose from "mongoose";

const ReviewIssueSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    severity: { type: String, required: true },
    description: { type: String, required: true },
    suggestions: [{ type: String, required: true }],
    confidence: { type: Number, required: true },
    citations: [{ type: String, required: true }],
  },
  { _id: false },
);

const ReviewSchema = new mongoose.Schema(
  {
    draftId: { type: String, required: true, index: true },
    summary: { type: String, required: true },
    issues: { type: [ReviewIssueSchema], default: [] },
    overallConfidence: { type: Number, required: true },
    reflectionNotes: { type: [String], default: [] },
    retrievalUsed: { type: Boolean, default: true },
    initialConfidence: { type: Number, default: 0 },
    finalConfidence: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Review = mongoose.model("Review", ReviewSchema);

export default Review;
