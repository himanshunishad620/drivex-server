const { default: axios } = require("axios");
const UserStorage = require("../models/userStorageModel");
const { verifyToken } = require("../services/jwtServices");
const Cloudinary = require("./../config/cloudinary");
const {
  categorizeFile,
  getCategoryUpdate,
  getResourceType,
} = require("../services/fileSevices");

exports.renameFile = async (req, res) => {
  const { _id, fileName, newName } = req.body;

  const token = req.cookies.token;
  if (!token) return res.status(404).json({ msg: "Token Not Found!" });

  const userId = verifyToken(req.cookies.token)._id;

  const newFileName = newName + "." + fileName.split(".").pop();
  try {
    if (!userId || !newName) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    await UserStorage.updateOne(
      { userId, "files._id": _id },
      { $set: { "files.$.name": newFileName } },
    );

    return res.json({ message: "File renamed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.deleteFile = async (req, res) => {
  if (!req.cookies.token) {
    return res.status(404).json({ msg: "No valid Token" });
  }
  const userId = verifyToken(req.cookies.token)._id;
  try {
    const { public_id, fileName, _id, type, size } = req.query;
    const resource_type = getResourceType(fileName);
    if (!public_id) {
      return res.status(400).json({ error: "public_id is required" });
    }

    const result = await Cloudinary.uploader.destroy(public_id, {
      resource_type,
    });

    await UserStorage.findOneAndUpdate(
      { userId: userId },
      {
        $pull: {
          files: { _id: _id },
        },
        $inc: getCategoryUpdate(type, size, false),
      },

      { new: true },
    );

    res.status(200).json({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getStorage = async (req, res) => {
  if (!req.cookies.token) {
    return res.status(404).json({ msg: "No valid Token" });
  }
  const userId = verifyToken(req.cookies.token)._id;
  const now = new Date();
  try {
    const result = await UserStorage.findOne({ userId });
    res.status(200).json({
      result,
      local: now.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }),
    });
  } catch (error) {
    res.status(404).json({ msg: "Not found!" });
  }
};

exports.fileUpload = async (req, res) => {
  const file = req.file;
  const token = req.cookies.token;
  const decoded = verifyToken(token);
  const type = categorizeFile(req.file);

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const resultClodinary = await Cloudinary.uploader.upload_stream(
      { resource_type: getResourceType(file.originalname) },
      async (error, uploadedFile) => {
        if (error) {
          return res.status(500).json({ message: "Upload failed", error });
        }
        const newFile = {
          name: file.originalname,
          size: file.size,
          downloadUrl: uploadedFile.secure_url,
          fileType: type,
          publicId: uploadedFile.public_id,
        };
        const result = await UserStorage.findOneAndUpdate(
          { userId: decoded._id },
          {
            $push: {
              files: newFile,
              lastUpload: { name: newFile.name, fileType: type },
            },
            $inc: getCategoryUpdate(type, newFile.size, true),
          },

          { new: true },
        );
        res.json(result);
      },
    );
    resultClodinary.end(req.file.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};

exports.download = async (req, res) => {
  const { url, fileName } = req.query;
  try {
    if (!url) return res.status(400).json({ message: "URL is required" });

    const parts = url.split("/");

    const publicId = parts[parts.length - 1].split(".")[0]; // remove extension if any

    const info = await Cloudinary.api.resource(publicId, {
      resource_type: getResourceType(fileName),
    });
    const fileUrl = info.secure_url;

    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", response.headers["content-type"]);
    res.send(response.data);
  } catch (err) {
    res.status(500).json({ message: "Download failed", error: err.message });
  }
};
