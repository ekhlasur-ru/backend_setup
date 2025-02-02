import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    photo: {
      type: String,
    //   required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notice", noticeSchema);
