"use strict";

const { graphql, buildSchema } = require("graphql");
const MongoClient = require("mongodb").MongoClient;

var clientsDB;

const schema = buildSchema(`
  type News {
    title : String
    description : String
    content : String
    urlToImage : String
    url : String
  }

  type Query {
    news : [News]
  }
`);

const root = {
  news: async () => {
    let clientsDB = await prepareDB();
    return await clientsDB
      .collection("articles")
      .find({})
      .toArray();
  }
};

module.exports = (event, context) => {
  graphql(schema, event.body, root)
    .then(response => {
      context.status(200).succeed(response);
    })
    .catch(err => {
      context.status(500).fail(err);
    });
};

const prepareDB = () => {
  const url = "mongodb://" + process.env.mongo + ":27017/news";

  return new Promise((resolve, reject) => {
    if (clientsDB) {
      console.error("DB already connected.");
      return resolve(clientsDB);
    }

    console.error("DB connecting");

    MongoClient.connect(url, (err, database) => {
      if (err) {
        return reject(err);
      }

      clientsDB = database.db("news");
      return resolve(clientsDB);
    });
  });
};

// signup: ({ input }) => {
//   const url = process.env.auth;
//   let options = {
//     method: "POST",
//     mode: "cors",
//     credentials: "same-origin",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.parse({ isCreateToken: true, payload: input })
//   };

//   const res = await fetch(url, options);
//   return JSON.stringify(res);
// },

// login: async ({ input }) => {
//   let clientsDB = await prepareDB();

//   return new Promise((resolve, reject) => {
//     clientsDB.collection("users").findOne(input, (err, result) => {
//       if (err) throw err;

//       resolve(JSON.stringify(result));
//     });
//   });
// }

// input UserInfo {
//   name : String!
//   password : String!
//   mobile : String!
//   email : String
// }

// input LoginInfo {
//   mobile : String!
//   password : String!
// }

// type Query {
//   hello: String
// }

// type Mutation {
//   login(input:LoginInfo!) : String!
//   signup(input : UserInfo!): String!
// }

// signup: async ({ input }) => {
//   let clientsDB = await prepareDB();
//   const url = process.env.auth;

//   return new Promise((resolve, reject) => {
//     let options = {
//       method: "POST",
//       uri: url,
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({ isCreateToken: true, payload: input }),
//       json: true
//     };

//     rp(options)
//       .then(_res => resolve(JSON.stringify(_res)))
//       .catch(_err => reject(_err));

// clientsDB.collection("users").insertOne(input, (err, res) => {
//   if (err) throw err;
//   const url = process.env.auth;
// });
//   });
// }
