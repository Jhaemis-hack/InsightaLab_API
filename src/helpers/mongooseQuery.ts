import mongoose from "mongoose";

export const getById = async (model: mongoose.Model<any>, id: any) => {
  return await model.findOne({ _id: id });
};

export const getByIdAndPopulate = async (model: mongoose.Model<any>, id: any, field: string[]) => {
  return await model.findOne({ _id: id }).populate(field);
};

export const getByEmail = async (model: mongoose.Model<any>, email: string) => {
  return await model.findOne({ email: email });
};

export const getByQuery = async (model: mongoose.Model<any>, query: any = {}) => {
  return await model.findOne(query);
};

export const getByQueryAndPopulate = async (model: mongoose.Model<any>, query: any = {}, field: string[]) => {
  return await model.findOne(query).populate(field);
};

export const getAll = async (model: mongoose.Model<any>) => {
  return await model.find();
};

export const getAllAndPopulate = async (model: mongoose.Model<any>, field: string[]) => {
  return await model.find().populate(field);
};

export const getFew = async (model: mongoose.Model<any>, query: any = {}) => {
  return await model.find(query);
};

export const getFewAndPopulate = async (model: mongoose.Model<any>, query: any = {}, field: string[]) => {
  return await model.find(query).populate(field);
};

export const create = async (model: mongoose.Model<any>, data: any = {}) => {
  return await model.create(data).then(async (data) => await data.save());
};

export const deleteById = async (model: mongoose.Model<any>, id: string) => {
  return await model.findByIdAndDelete({ _id: id });
};

export const updateById = async (
  model: mongoose.Model<any>,
  id: string,
  updateData: any = {}
) => {
  return await model.findByIdAndUpdate({ _id: id }, { $set: updateData }, { new: true });
};
