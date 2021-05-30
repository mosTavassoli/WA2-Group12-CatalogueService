import express from "express";
import { graphqlHTTP } from "express-graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs } from "./graphql/types.js";
import { resolvers } from "./graphql/resolvers.js";
import mongooseConnection from "./src/db/mongooseConnection";
import morgan from "morgan";
const app = express();
const port = 3000;
app.use(morgan("tiny"));

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

mongooseConnection()
  .then(() => {
    app.listen(port, () => console.log(`The Server ready on port ${port}`));
  })
  .catch((err) => {
    console.log(err);
  });
