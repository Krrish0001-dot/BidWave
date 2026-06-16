const Auction = require("../models/Auction");

const createAuction = async (req, res) => {
  try {
    const { title, description, startingPrice, startTime, endTime, category } = req.body;

    if (!title || !description || !startingPrice || !startTime || !endTime || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const auction = await Auction.create({
      title,
      description,
      sellerId: req.user.id,
      startingPrice,
      currentPrice: startingPrice,
      startTime,
      endTime,
      category,
      imageUrl: req.file ? req.file.location : null,
    });

    res.status(201).json({
      success: true,
      message: "Auction created successfully",
      auction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ sellerId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, auctions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllAuctions = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;

    const auctions = await Auction.find(filter)
      .populate("sellerId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Auction.countDocuments(filter);

    res.json({
      success: true,
      count: auctions.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      auctions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate("sellerId", "name email")
      .populate("highestBidder", "name email");

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }
    res.json({ success: true, auction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ success: false, message: "Auction not found" });
    }
    if (auction.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own auctions",
      });
    }
    if (auction.status !== "upcoming") {
      return res.status(400).json({
        success: false,
        message: "Cannot update a live or ended auction",
      });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.imageUrl = req.file.location;
    }

    const updated = await Auction.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: "Auction updated", auction: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ success: false, message: "Auction not found" });
    }
    if (auction.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own auctions",
      });
    }
    if (auction.status === "live") {
      return res.status(400).json({ success: false, message: "Cannot delete a live auction" });
    }

    await Auction.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Auction deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAuction,
  getMyAuctions,
  getAllAuctions,
  getAuction,
  updateAuction,
  deleteAuction,
};