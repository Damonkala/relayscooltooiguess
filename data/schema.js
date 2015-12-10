/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
} from 'graphql-relay';

// import { } from './database';

var {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    // if (type === 'Game') {
    //   return getGame(id);
    // } else if (type === 'HidingSpot') {
    //   return getHidingSpot(id);
    // } else {
    //   return null;
    // }
  },
  (obj) => {
    // if (obj instanceof Game) {
    //   return gameType;
    // } else if (obj instanceof HidingSpot)  {
    //   return hidingSpotType;
    // } else {
    //   return null;
    // }
  }
);

var store = { dummy: 42 };

store.links = [
  {_id: 1, title: "Google", url: "https://google.com"},
  {_id: 2, title: "Yahoo", url: "yahoo.com"},
  {_id: 3, title: "HP", url: "https://hp.com"},
  {_id: 4, title: "Dell", url: "https://dell.com"},
  {_id: 5, title: "GraphQL", url: "http://graphql.org"},
  {_id: 6, title: "React", url: "http://facebook.github.io/react"},
  {_id: 7, title: "Relay", url: "http://facebook.github.io/relay"}
];
var school = {};
school.instructors = [
  {_id: 1, firstName: "George", lastName: "Someone", age: 45, gender: "male"},
  {_id: 2, firstName: "Jared", lastName: "Mileworth", age: 25, gender: "male"}
]
school.students = [
  {_id: 1, fullName: "John Egbert", firstName: "John", lastName: "Egbert", age: 14, gender: "male", level:"freshman", GPA: 3.00, course: 0},
  {_id: 2, fullName: "Dave Strider", firstName: "Dave", lastName: "Strider", age: 15, gender: "male", level:"junior", GPA: 2.78, course: 1}
]
school.courses = [
  {_id: 1, name: "math", instructor: 0, grade: 0},
  {_id: 2, name: "english", instructor: 1, grade: 1}
]
school.grades = [
  {_id: 1, student: 0, course: 0, score: "B"},
  {_id: 2, student: 1, course: 1, score: "C"}
]
let linkType = new GraphQLObjectType({
  name: 'Link',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: (obj) => obj._id
    },
    title: {
      type: GraphQLString,
      args: {
        upcase: { type: GraphQLBoolean }
      },
      resolve: (obj, {upcase}) => upcase ? obj.title.toUpperCase() : obj.title
     },
    url: {
      type: GraphQLString,
      resolve: (obj) => {
        return obj.url.startsWith("http") ? obj.url : `http://${obj.url}`
      }
    },
    safe: {
      type: GraphQLBoolean,
      resolve: obj => obj.url.startsWith("https")
    }
  }),
  interfaces: [nodeInterface]
});
let instructorType = new GraphQLObjectType({
  name: 'Instructor',
  fields: () => ({
  id:{type: new GraphQLNonNull(GraphQLID),
  resolve: (obj) => obj._id},
  fullName: {type: GraphQLString},
  firstName: {type: GraphQLString},
  lastName: {type: GraphQLString},
  age: {type: GraphQLInt},
  gender: {type: GraphQLString},
}),
  interfaces: [nodeInterface]
});
let studentType = new GraphQLObjectType({
  name: 'student',
  fields: () => ({
  id:{type: new GraphQLNonNull(GraphQLID),
  resolve: (obj) => obj._id},
  fullName: {type: GraphQLString},
  firstName: {type: GraphQLString},
  lastName: {type: GraphQLString},
  age: {type: GraphQLInt},
  gender: {type: GraphQLString},
  level: {type: GraphQLString},
  GPA: {type: GraphQLInt},
  course: {
    type: courseType,
    resolve: (obj)=>{
      return school.courses[obj.course];
    }
  },
}),
  interfaces: [nodeInterface]
});
let courseType = new GraphQLObjectType({
  name: 'course',
  fields: () => ({
  id:{type: new GraphQLNonNull(GraphQLID),
  resolve: (obj) => obj._id},
  name: {type: GraphQLString},
  instructor: {
        type: instructorType,
        resolve: (obj)=>{
          return school.instructors[obj.instructor];
        }
      },
  grade: {
        type: gradeType,
        resolve: (obj)=>{
          return school.grades[obj.grade];
        }
      },
}),
  interfaces: [nodeInterface]
});
let gradeType = new GraphQLObjectType({
  name: 'grade',
  fields: () => ({
  id:{type: new GraphQLNonNull(GraphQLID),
  resolve: (obj) => obj._id},
  student: {
        type: studentType,
        resolve: (obj)=>{
          return school.students[obj.student];
        }
      },
      course: {
        type: courseType,
        resolve: (obj)=>{
          return school.courses[obj.course];
        }
      },
  score: {type: GraphQLString},

}),
  interfaces: [nodeInterface]
});

var {connectionType: linkConnection} =
  connectionDefinitions({name: 'Link', nodeType: linkType});
var {connectionType: instructorConnection} =
  connectionDefinitions({name: 'Instructor', nodeType: instructorType});
var {connectionType: studentConnection} =
  connectionDefinitions({name: 'student', nodeType: studentType});
var {connectionType: courseConnection} =
  connectionDefinitions({name: 'course', nodeType: courseType});
var {connectionType: gradeConnection} =
  connectionDefinitions({name: 'grade', nodeType: gradeType});


var storeType = new GraphQLObjectType({
  name: 'Store',
  fields: () => ({
    id: globalIdField('Store'),
    dummy: {
      type: GraphQLInt
    },
    links: {
      type: linkConnection,
      args: connectionArgs,
      resolve: (obj, args) => connectionFromArray(obj.links, args)
    },
    total: {
      type: GraphQLInt,
      resolve: (obj) => obj.links.length
    }
  }),
  interfaces: [nodeInterface]
});
var schoolType = new GraphQLObjectType({
  name: 'School',
  fields: () => ({
    id: globalIdField('School'),
    instructors: {
      type: instructorConnection,
      args: connectionArgs,
      resolve: (obj, args) => connectionFromArray(obj.instructors, args)
    },
    students: {
        type: studentConnection,
        args: {
          filter: { type: GraphQLString },
          ...connectionArgs
        },
        resolve: (obj, args) => {
          let filteredStudents = obj.students.filter(student => student.firstName.match(args.filter));
          return connectionFromArray(filteredStudents, args);
        }
      },
    courses: {
      type: courseConnection,
      args: connectionArgs,
      resolve: (obj, args) => connectionFromArray(obj.courses, args)
    },
    grades: {
      type: gradeConnection,
      args: connectionArgs,
      resolve: (obj, args) => connectionFromArray(obj.grades, args)
    },
  }),
  interfaces: [nodeInterface]
});

var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField,
    store: {
      type: storeType,
      resolve: () => store
    },
    school: {
      type: schoolType,
      resolve: () => school
    }
  }),
});

export var Schema = new GraphQLSchema({
  query: queryType,
  // Uncomment the following after adding some mutation fields:
  // mutation: mutationType
});
