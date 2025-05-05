const SearchWasher = require('../models/searchWasherModel');
const Washer = require('../models/washerModel');
const Service = require('../models/serviceModel');

const createSearchWasher = async (data) => {
  return await SearchWasher.create(data);
};

const getAllSearchWashers = async () => {
  return await SearchWasher.find().select('-password');
};

const getSearchWasherById = async (userId) => {
  return await SearchWasher.findById(userId).select('-password');
};

const updateSearchWasher = async (userId, data) => {
  return await SearchWasher.findByIdAndUpdate(userId, data, {
    new: true,
    runValidators: true,
  }).select('-password');
};

const deleteSearchWasher = async (userId) => {
  return await SearchWasher.findByIdAndDelete(userId);
};

const getNearbyWashers = async (userId) => {
  const user = await SearchWasher.findById(userId);
  if (!user) throw new Error('Utilisateur introuvable');

  return await Washer.find({ city: user.city }).select('-password');
};

const getServiceHistoryByUser = async (userId) => {
  return await Service.find({ userId });
};

const getStatisticsByUser = async (userId) => {
  const totalServices = await Service.countDocuments({ userId });
  const lastService = await Service.findOne({ userId }).sort({ date: -1 });

  return {
    totalServices,
    lastServiceDate: lastService ? lastService.date : null,
  };
};

const createNewService = async (data) => {
  return await Service.create(data);
};

module.exports = {
  createSearchWasher,
  getAllSearchWashers,
  getSearchWasherById,
  updateSearchWasher,
  deleteSearchWasher,
  getNearbyWashers,
  getServiceHistoryByUser,
  getStatisticsByUser,
  createNewService,
};
