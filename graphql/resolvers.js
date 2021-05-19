const Product = require("../src/db/models/product");
const Comment = require("../src/db/models/comment");
const mongoose = require("mongoose");

const commets = (commentIds) => {
  return Comment.find({ _id: { $in: commentIds } })
    .then((commets) => {
      return commets.map((comment) => {
        return { ...comment._doc, _id: comment.id };
      });
    })
    .catch((err) => {
      throw err;
    });
};

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

  //  --------------------------------------------------------

  Query: {
    product: async (parent, args, context, info) => {
      try {
        const result = await Product.findOne(mongoose.Types.ObjectId(args.id));
        console.log(result);
        return {
          ...result._doc,
          comments: commets.bind(this, result._doc.comments),
        };
      } catch (error) {
        console.log(error);
      }
    },
  },
};
