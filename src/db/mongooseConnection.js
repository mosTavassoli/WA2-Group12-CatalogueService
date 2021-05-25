import mongoose from "mongoose";

const mongooseConnection = () => {
  try {
    return mongoose.connect("mongodb://127.0.0.1:27017/catalogue-service", {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export default mongooseConnection;
