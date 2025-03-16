import {
  addWater,
  updateWater,
  deleteWater,
  getDailyWater,
  getMonthlyWater,
} from '../services/water.js';

// додає запис
export const addWaterController = async (req, res, next) => {
  const { volume, date } = req.body;

  const userId = req.user._id;

  const newWater = await addWater(userId, volume, date);

  res.status(201).json({
    status: 201,
    message: 'Successfully added water record!',
    data: newWater,
  });
};

// редагування
export const updateWaterController = async (req, res, next) => {
  const { id } = req.params;
  const { volume, date } = req.body;

  const userId = req.user._id;

  const updatedWater = await updateWater(userId, id, volume, date);

  res.json({
    status: 200,
    message: 'Successfully updated water record!',
    data: updatedWater,
  });
};

// виделення
export const deleteWaterController = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  await deleteWater(userId, id);

  res.status(204).send();
};

// за день
export const getDailyWaterController = async (req, res, next) => {
  const userId = req.user._id;
  const { day } = req.query;

  const waterEntries = await getDailyWater(userId, day);

  res.json({
    status: 200,
    message: 'Successfully retrieved daily water records!',
    data: waterEntries,
  });
};

export const getMonthlyWaterController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({
        status: 400,
        message: 'Month parameter is required (format: MM-YYYY)',
      });
    }

    const waterEntries = await getMonthlyWater(userId, month);

    res.json({
      status: 200,
      message: 'Successfully retrieved monthly water records!',
      data: waterEntries,
    });
  } catch (error) {
    next(error);
  }
};
