import fs from "fs";
import path, { dirname } from "path";

type Callback = (
  msg: NodeJS.ErrnoException | boolean | null | string,
  data?: string
) => void;

type Lib = {
  basedir?: string;
  create: (dir: string, file: string, data: object, callback: Callback) => void;
  read: (dir: string, file: string, cb: Callback) => void;
  update: (dir: string, file: string, data: object, callback: Callback) => void;
};

const lib: Lib = {
  create: () => {},
  read: () => {},
  update: () => {},
};

lib.basedir = path.join(__dirname, "./../.data/");
//write data to file
lib.create = (dir, file, data, callback) => {
  const filePath = `${lib.basedir + dir}/${file}.json`;
  const dirPath = dirname(filePath);

  //make directory if not exist
  fs.mkdir(dirPath, { recursive: true }, (err) => console.log(err));

  //open file for write
  fs.open(`${lib.basedir + dir}/${file}.json`, "wx", (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      //convert to string
      const stringData = JSON.stringify(data);

      fs.writeFile(fileDescriptor, stringData, (err) => {
        if (!err) {
          fs.close(fileDescriptor, (err) => {
            if (!err) {
              callback(false);
            } else {
              callback(err);
            }
          });
        } else {
          callback(err);
        }
      });
    } else {
      callback(err);
    }
  });
};

lib.read = (dir, file, callback) => {
  const filePath = `${lib.basedir + dir}/${file}.json`;
  fs.readFile(filePath, "utf-8", (err, data) => {
    callback(err, data);
  });
};

lib.update = (dir, file, data, cb) => {
  const filePath = `${lib.basedir + dir}/${file}.json`;
  fs.open(filePath, "r+", (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      //convert data to string
      const stringData = JSON.stringify(data);
      fs.truncate(filePath, (err) => {
        if (!err) {
          fs.writeFile(fileDescriptor, stringData, (err) => {
            if (!err) {
              fs.close(fileDescriptor, (err) => {
                if (!err) cb(false);
                else cb("Error closing file");
              });
            } else {
              console.log("Error Writing to file");
            }
          });
        } else {
          console.log("Error truncating file");
        }
      });
    } else {
      cb("Error updating file may not exist");
    }
  });
};

export default lib;
