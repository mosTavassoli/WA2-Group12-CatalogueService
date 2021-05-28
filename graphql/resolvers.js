import Product from "../src/db/models/product";
import Comment from "../src/db/models/comment";
import mongoose from "mongoose";

const comments = async (commentIds) => {
  return await Comment.find({ _id: { $in: commentIds } })
    .then((comments) => {
      return comments.map((comment) => {
        return { ...comment._doc, _id: comment.id };
      });
    })
    .catch((err) => {
      throw err;
    });
};

export const resolvers = {
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
      let resultComments = [];
      try {
        const result = await Product.findOne(mongoose.Types.ObjectId(args.id));
        resultComments = await comments(result._doc.comments);
        return {
          ...result._doc,
          comments: ({ numberOfLastRecentComments }) => {
            // let last = numberOfLastRecentComments.numberOfLastRecentComments;
            if (resultComments.length >= numberOfLastRecentComments) {
              return resultComments
                .reverse()
                .slice(0, numberOfLastRecentComments);
            }
            return resultComments.reverse();
          },
        };
      } catch (error) {
        console.log(error);
      }
    },

    products: async (parent, args, context, info) => {
      const { filter, sort } = args;
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
        var query = Product.find();
        if (filter.minStars !== undefined) {
          query.where("stars").gte(filter.minStars);
        }
        if (filter.categories !== undefined) {
          query.where("category").in(filterCat);
        }
        if (filter.minPrice !== undefined) {
          query.where("price").gte(filter.minPrice);
        }
        if (filter.maxPrice !== undefined) {
          query.where("price").lte(filter.maxPrice);
        }
        products = await Product.find(query).sort([[value, order]]);
      }
      return products.map((product) => {
        return {
          _id: product.id,
          name: product.name,
          createdAt: product.createdAt,
          description: product.description,
          price: product.price,
          comments: comments.bind(this, product._doc.comments),
          category: product.category,
          stars: product.stars,
        };
      });
    },
  },
};
