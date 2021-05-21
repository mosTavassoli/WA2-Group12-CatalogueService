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

  // TODO RAZI ==  comments (numberOfLastRecentComments: Int) ===> look at the PDF
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
      // console.log(sort);
      // let value = sort.value;
      let filterCat;
      let value;
      let order;

      if (typeof filter != "undefined" && "categories" in filter) {
        filterCat = filter.categories[0];
      } else {
        filterCat = null;
      }
      if (typeof sort == "undefined") {
        value = null;
        order = null;
      } else {
        value = sort.value;
        order = sort.order;
      }
      let products;
      if (typeof filter == "undefined" || Object.keys(filter).length === 0) {
        products = await Product.find().sort([[value, order]]);
      } else {
        //TODO filter == Siavash ===== the filter Part
        if (
          "categories" in filter &&
          "minStars" in filter &&
          "minPrice" in filter &&
          "maxPrice" in filter
        ) {
          products = await Product.find({
            $and: [
              {
                stars: { $gte: filter.minStars },
                category: { $in: filterCat },
                // price: { $gte: filter.minPrice },
                $or: [
                  { price: { $gte: filter.minPrice } },
                  { price: { $gte: filter.maxPrice } },
                ],
              },
            ],
          }).sort([[value, order]]);
        }
        if (
          "categories" in filter &&
          "minStars" in filter &&
          "minPrice" in filter
        ) {
          products = await Product.find({
            $and: [
              {
                stars: { $gte: filter.minStars },
                category: { $in: filterCat },
                // price: { $gte: filter.minPrice },
                price: { $gte: filter.minPrice },
              },
            ],
          }).sort([[value, order]]);
        } else if ("categories" in filter) {
          products = await Product.find({
            category: { $in: filterCat },
          }).sort([[value, order]]);
        } else if ("minStars" in filter) {
          products = await Product.find({
            stars: { $gte: filter.minStars },
          }).sort([[value, order]]);
        }
      }
      //TODO filter == Siavash =====
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
