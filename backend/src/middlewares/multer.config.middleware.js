import multer from "multer";
import fs from "fs";
import path from "path";

//To check if the folder exists
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

//Creating local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

//Setting allowed file types
const fileFilter = (req, file, cb) => { // cb stands for callback just like nex and holds null(error) and other parameter
    const allowedTypes = /jpg|jpeg|png/;
    const ext = path.extname(file.originalname).toLowerCase(); // extracting file extentions for validating converts uppercase extentions to lowercase
    if(allowedTypes.test(ext)){
        cb(null, true)
    }else{
        cb(new Error('❌ Only .jpeg, .jpg and .png files are allowed'), false);
    }
}
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 //5MB max
    }
})