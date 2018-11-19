## Parse input by a scheme defined as json
Consider you want to transform the below json object, into a nested json object we used to from MEAN stack.
```js
var input = [
  {pid: 1, contributor: 'jdalton', projectID: 1, projectName: 'lodash'},
  {pid: 1, contributor: 'jdalton', projectID: 2, projectName: 'docdown'},
  {pid: 1, contributor: 'jdalton', projectID: 3, projectName: 'lodash-cli'},
  {pid: 2, contributor: 'contra',  projectID: 4, projectName: 'gulp'},
  {pid: 3, contributor: 'phated',  projectID: 4, projectName: 'gulp'},
]
```
Instead of producing a lot of duplicated code to accomplish such transformations. We declare a scheme as a json object:
```js
var scheme = {
  "$group[contributors](pid)": {
    "id": "pid",
    "name": "contributor",
    "$group[projects](projectID)": {
      "id": "projectID",
      "name": "projectName"
    }
  }
};
console.log(shape.parse(input, scheme));
```
This is what you get:
```json
{
  "contributors": [
    {
      "id": 1,
      "name": "jdalton",
      "projects": [
        {
          "id": 1,
          "name": "lodash"
        },
        {
          "id": 2,
          "name": "docdown"
        },
        {
          "id": 3,
          "name": "lodash-cli"
        }
      ]
    },
    {
      "id": 2,
      "name": "contra",
      "projects": [
        {
          "id": 4,
          "name": "gulp"
        }
      ]
    },
    {
      "id": 3,
      "name": "phated",
      "projects": [
        {
          "id": 4,
          "name": "gulp"
        }
      ]
    }
  ]
}
```
## Parse nested json objects as input with a scheme defined as json
```js
/* Input */
let input = {
    topic: "sample of books",
    data: {
        books: [
            { index: 1, author: 'bart', name: 'title1' },
            { index: 2, author: 'arya', name: 'title2' },
            { index: 3, author: 'gwen', name: 'title3' },
            { index: 4, author: 'arya', name: 'title4' },
            { index: 5, author: 'lara', name: 'title5' }
        ]
    }
}

/* Template */
let template = {
    "currentTopic": "topic",
    "$foreach[library](data.books)": {
        "bookIndex": "index",
        "bookAuthor": "author",
        "bookName": "name"
    }
}

console.log(shape.parse(input, template));
/*
{ 
    currentTopic: 'sample of books',
    library: [
        { bookIndex: 1, bookAuthor: 'bart', bookName: 'title1' },
        { bookIndex: 2, bookAuthor: 'arya', bookName: 'title2' },
        { bookIndex: 3, bookAuthor: 'gwen', bookName: 'title3' },
        { bookIndex: 4, bookAuthor: 'arya', bookName: 'title4' },
        { bookIndex: 5, bookAuthor: 'lara', bookName: 'title5' } 
    ] 
}
*/
```
## Flexible syntax
Even if it is less useful, you have the possibility to 
modify the text of the operations by keeping some important keywords. 
This allows you to get a clearer model.
```js
let template = {
    "currentTopic": "topic",
    "$foreach item of (data.books) push it on [library] section": {
        "bookIndex": "index",
        "bookAuthor": "author",
        "bookName": "name"
    }
}
```

## eval
Templates allows "eval" keyword to be used in order to generate complex conditions from piece of code. 
Currently, you can get values from your input data with the "$value" operator, where an simple example is shown just below.

```js
let input = { 
  name: 'marc',
  age: 25
}

let template = {
  "$eval[isMarc]": "$value(name) === 'marc'",
  "$eval[description]": "let a = $value(age); let n = $value(name); if(a > 18) n + ' is an adult'; else n + ' is a child'"
}

console.log(shape.parse(input, template));
/*
{ 
  "isMarc": true,
  "description": "marc is an adult" 
}
*/
```

## Parsing nested json objects as input
```js
let scheme = {
  "$mirror(id)": {
    "name": "event.name"
  }
};

let nestedInput = [{
  id: 1,
  event: {
    name: 'lookup',
  }
},{
  id: 2,
  event: {
    name: 'add',
  }
}];
console.log(shape.parse(nestedInput, scheme));
```
```json
[ { "name": "lookup" }, { "name": "add" } ]
```

Another example:
```js
var scheme = {
  "$mirror[projects](projectID)": {
    "project": {
      "id": "projectID",
      "name": "projectName"
    }
  }
};
console.log(shape.parse(input, scheme));
```
```json
{
  "projects": [
    {
      "project": {
        "id": 1,
        "name": "lodash"
      }
    },
    {
      "project": {
        "id": 2,
        "name": "docdown"
      }
    },
    {
      "project": {
        "id": 3,
        "name": "lodash-cli"
      }
    },
    {
      "project": {
        "id": 4,
        "name": "gulp"
      }
    }
  ]
}
```

The same example as above as Array:
```js
var scheme = {
  "$mirror(projectID)": {
    "project": {
      "id": "projectID",
      "name": "projectName"
    }
  }
};
console.log(shape.parse(input, scheme));
```
```json
[
  {
    "project": {
      "id": 1,
      "name": "lodash"
    }
  },
  {
    "project": {
      "id": 2,
      "name": "docdown"
    }
  },
  {
    "project": {
      "id": 3,
      "name": "lodash-cli"
    }
  },
  {
    "project": {
      "id": 4,
      "name": "gulp"
    }
  }
]
```

## Assign default values by scheme
```js
var simpleAssignScheme = {
  "id": "pid",
  "$set[active]": true // true in all objects
};
console.log(shape.parse(input, simpleAssignScheme));
```
```json
{ "id": 1, "active": true }
```

## Extend parse method with own operation
```js
shape.define('growth', function(operation, provider, scheme, helpers){
  var parse = helpers.parse;

  var modifiedProvider = provider.map(function(point){
    point.rate *= 100;
    return point;
  });

  return parse(modifiedProvider, scheme);
});

var scheme = {
  "$growth[growth]": {
    "$mirror[rates]": {
      "name": "name",
      "percent": "rate"
    }
  }
};

var input = [
  {
    "name": "test1",
    "rate": 0.1
  },{
    "name": "test2",
    "rate": 0.2
  }
];

var result = shape.parse(input, scheme);
//result equals:
{
  growth: {
    rates: [
      {
        "name": "test1",
        "percent": 10
      },{
        "name": "test2",
        "percent": 20
      }
    ]
  }
}
```

## Create a scheme as object.
```js
var scheme = shape.scheme()
  .mirror({ id: 'pid', last_name: 'lastName' })
  .indexBy('id');
```

## Apply a scheme.
```js
var inputs = [{
  pid: 1,
  lastName: 'Stehle',
  firstName: 'Andre'
},{
  pid: 2,
  lastName: 'lastname',
  firstName: 'firstname'
}];

console.log(scheme.form(inputs));
/*
  {
    1:{
      id: 1,
      last_name: 'Stehle'
    },
    2:{
      id: 2,
      last_name: 'lastname'
    }
  }
*/
```

## API Documentation

## mirror a collection
Mirror a json by a scheme.

```js
var input = {
  pid: 1,
  lastName: 'Stehle',
  firstName: 'Andre'
};
var scheme = {
  id: 'pid',
  last_name: 'lastName',
};

console.log(shape.mirror(input, scheme));
/*
  {
    id: 1,
    last_name: 'Stehle'
  }
*/


var inputs = [{
  pid: 1,
  lastName: 'Stehle',
  firstName: 'Andre'
},{
  pid: 2,
  lastName: 'lastname',
  firstName: 'firstname'
}];

console.log(shape.mirror(inputs, scheme));
/*
  [{
    id: 1,
    last_name: 'Stehle'
  },{
    id: 2,
    last_name: 'lastname'
  }]
*/
```

## indexing
Index an Array by a key.

```js
var inputs = [{
  id: 1,
  last_name: 'Stehle'
},{
  id: 2,
  last_name: 'lastname'
}];

console.log(shape.indexBy(inputs, 'id'));
/*
  {
    1:{
      id: 1,
      last_name: 'Stehle'
    },
    2:{
      id: 2,
      last_name: 'lastname'
    }
  }
*/
```
## chaining
Chaining previous examples.

```js
var inputs = [{
  pid: 1,
  lastName: 'Stehle',
  firstName: 'Andre'
},{
  pid: 2,
  lastName: 'lastname',
  firstName: 'firstname'
}];

var result = shape.chain(inputs)
  .mirror(scheme)
  .indexBy('id')
  .collection;
console.log(result);
/*
  {
    1:{
      id: 1,
      last_name: 'Stehle'
    },
    2:{
      id: 2,
      last_name: 'lastname'
    }
  }
*/
```

## Related

- [shape-array](https://github.com/ansteh/shape-array) - Convert array to json object
- [difference-json](https://github.com/ansteh/difference-json) - Prompt the diffrence of two json objects

## License

MIT © [Andre Stehle](https://github.com/ansteh)
