const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');

var items = {};
const promisifiedReadFile = Promise.promisify(fs.readFile);
// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    var filepath = path.join(exports.dataDir, `${id}.txt`);

    fs.writeFile(filepath, text, (err) => {
      if (err) {
        callback(err);
      } else {
        callback(null, {id, text});

      }
    });
  });
};

// exports.readAll = (callback) => {
//   var data = _.map(items, (text, id) => {
//     return { id, text };
//   });
//   callback(null, data);
// };

exports.readAll = (callback) => {

  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      console.log(err);
    }

    Promise.all(_.map(files, (file) => {
      var id = path.basename(file, '.txt');
      return new Promise((resolve, reject) => {
        fs.readFile(path.join(exports.dataDir, file), (err, text) => {
          if (err) {
            reject(err);
          } else {
            resolve({id, text: text.toString()});
          }
        });
      });
      // return promisifiedReadFile(path.join(exports.dataDir, file)).then(text => {return {id, text: text.toString()}});
    }
    )).then(values => callback(null, values));
    // Promise.all(data).then(values => callback(null, values));
  });
};

exports.readOne = (id, callback) => {
  var filepath = path.join(exports.dataDir, `${id}.txt`);

  fs.readFile(filepath, (err, text) => {
    if (err) {
      callback(err);
    } else {
      callback(null, {id, text: text.toString()});
    }
  });
};

exports.update = (id, text, callback) => {
  // var item = items[id];
  // if (!item) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   items[id] = text;
  //   callback(null, { id, text });
  // }
  var filepath = path.join(exports.dataDir, `${id}.txt`);
  fs.readFile(filepath, (err, data) => {
    if (err) {
      callback(err);
    } else {
      fs.writeFile(filepath, text, (err) => {
        if (err) {
          callback(err);
        } else {
          callback(null, {id, text});
        }
      });
    }
  });

};

exports.delete = (id, callback) => {
  // var item = items[id];
  // delete items[id];
  // if (!item) {
  //   // report an error if item not found
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback();
  // }
  var filepath = path.join(exports.dataDir, `${id}.txt`);
  fs.unlink(filepath, (err) => {
    callback(err);
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};