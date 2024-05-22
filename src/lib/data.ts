import fs from "fs";
import path, { dirname } from "path";

type Callback = (msg: NodeJS.ErrnoException | boolean | null) => void;

type Lib = {
  basedir?: string;
  create: (dir: string, file: string, data: object, callback: Callback) => void;
};

const lib: Lib = {
  create: () => {},
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

export default lib;
