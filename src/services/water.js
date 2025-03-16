import { WaterCollection } from '../db/models/water.js';
import createError from 'http-errors';
import mongoose from 'mongoose';

export const addWater = async (userId, volume, date) => {
  if (volume < 50 || volume > 5000) {
    throw createError(400, 'The volume of water should be from 50 to 5000 ml');
  }

  return WaterCollection.create({
    userId,
    volume,
    date: new Date(date),
  });
};

export const updateWater = async (userId, id, volume, date) => {
  if (volume < 50 || volume > 5000) {
    throw createError(400, 'The volume of water should be from 50 to 5000 ml');
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(400, 'Invalid water record ID');
  }

  const updatedWater = await WaterCollection.findOneAndUpdate(
    { _id: id, userId },
    { volume, date: new Date(date) },
    { new: true },
  );

  if (!updatedWater) {
    throw createError(404, 'No record found');
  }

  return updatedWater;
};

export const deleteWater = async (userId, id) => {
  const deletedWater = await WaterCollection.findOneAndDelete({
    _id: id,
    userId,
  });
  if (!deletedWater) {
    throw createError(404, 'No record found');
  }
};

export const getDailyWater = async (userId, date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return WaterCollection.find({ userId, date: { $gte: start, $lt: end } })
    .sort({ date: -1 })
    .lean()
    .then((entries) =>
      entries.map((entry) => ({ ...entry, date: new Date(entry.date) })),
    );
};

export const getMonthlyWater = async (userId, month) => {
  const [year, monthIndex] = month.split('-').map(Number);
  const start = new Date(year, monthIndex - 1, 1);
  const end = new Date(year, monthIndex, 0, 23, 59, 59, 999);

  const waterEntries = await WaterCollection.find({
    userId,
    date: { $gte: start, $lt: end },
  })
    .sort({ date: 1 })
    .lean();

  const groupedByDay = waterEntries.reduce((acc, { date, volume }) => {
    const day = new Date(date).getDate();
    acc[day] = (acc[day] || 0) + volume;
    return acc;
  }, {});

  const daysInMonth = new Date(year, monthIndex, 0).getDate();
  const result = Array.from({ length: daysInMonth }, (_, i) => {
    const formattedDate = `${year}-${String(monthIndex).padStart(
      2,
      '0',
    )}-${String(i + 1).padStart(2, '0')}`;
    return { date: formattedDate, stats: groupedByDay[i + 1] || 0 };
  });

  return result;
};
