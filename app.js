// const express = require("express");
// const { graphqlHTTP } = require("express-graphql");
// const { makeExecutableSchema } = require("@graphql-tools/schema");
// const mongoose = require("mongoose");
// const typeDefs = require("./graphql/types");
// const resolvers = require("./graphql/resolvers");

import express from "express";
import { graphqlHTTP } from "express-graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import mongoose from "mongoose";
import { typeDefs } from "./graphql/types.js";
import { resolvers } from "./graphql/resolvers.js";

const app = express();
const port = 3000;

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

mongoose
  .connect("mongodb://localhost:27017/catalogue-service", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(port, () => console.log(`The Server Runs on Port ${port}`));
  })
  .catch((err) => {
    console.log(err);
  });
