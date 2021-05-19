const Product = require("../src/db/models/product");
const Comment = require("../src/db/models/comment");

module.exports = resolvers = {
  Mutation: {
    productCreate: (parent, args, context, info) => {
      const { name, description, price, category } = args.productCreateInput;
      const productObj = new Product({
        name,
        description,
        price,
        category,
      });
      return productObj
        .save()
        .then((result) => {
          console.log(result);
          return { ...result._doc };
        })
        .catch((err) => {
          console.log(err);
        });
    },
    commentCreate: (parent, args, context, info) => {
      const { title, body, stars } = args.commentCreateInput;
      const commentObj = new Comment({
        title,
        body,
        stars,
      });
      let createdComment;
      return commentObj
        .save()
        .then((result) => {
          createdComment = { ...result._doc, _id: result._doc._id.toString() };
          return Product.findById(args.productId);
        })
        .then((product) => {
          if (!product) {
            throw new Error("Product Does not exist !!");
          }
          product.comments.push(commentObj);
          return product.save();
        })
        .then((result) => {
          console.log(result);
          return createdComment;
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
