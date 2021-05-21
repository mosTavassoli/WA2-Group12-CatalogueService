const Product = require("../src/db/models/product");
const Comment = require("../src/db/models/comment");
const mongoose = require("mongoose");
const { asArray } = require("@graphql-tools/utils");

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
  //  ----------------------- Mutation Type ---------------------------------
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
          product.stars = createdComment.stars;
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

  //  ----------------------- Query Type ---------------------------------

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

    products: async (parent, args, context, info) => {
      const { filter, sort } = args;
      let value = sort.value;
      let filterCat;
      if ("categories" in filter) {
        filterCat = filter.categories[0];
      } else {
        filterCat = null;
      }
      let products;
      if (Object.keys(filter).length === 0) {
        products = await Product.find();
      } else {
        products = await Product.find({
          $or: [
            { stars: { $gt: filter.minStars } },
            // { $or: [{ category: null }, { category: { $in: filterCat } }] },
            { category: { $in: filterCat } },
            { price: { $gt: filter.minPrice } },
            { price: { $lt: filter.maxPrice } },
          ],
        }).sort([[value, sort.order]]);
      }
      return products.map((product) => {
        return {
          _id: product.id,
          name: product.name,
          createdAt: product.createdAt,
          description: product.description,
          price: product.price,
          comments: commets.bind(this, product._doc.comments),
          category: product.category,
          stars: product.stars,
        };
      });
    },
  },
};
