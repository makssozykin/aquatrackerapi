import Joi from 'joi';

export const addWaterSchema = Joi.object({
  volume: Joi.number().min(50).max(5000).required().messages({
    'number.min': 'The volume of water must be at least {#limit} ml',
    'number.max': 'The volume of water should not exceed {#limit} ml',
    'any.required': 'The volume of water is mandatory',
  }),

  date: Joi.date().iso().required().messages({
    'date.format': 'Invalid date format. Use ISO 8601 format.',
  }),
});

export const updateWaterSchema = Joi.object({
  volume: Joi.number().min(50).max(5000).optional().messages({
    'number.min': 'The volume of water must be at least {#limit} ml',
    'number.max': 'The volume of water should not exceed {#limit} ml',
  }),
  date: Joi.date()
    .iso()
    .optional() // ці дані на вибір якщо їх не дали
    .messages({
      'date.format': 'Invalid date format. Use ISO 8601 format.',
    })
    .required()
    .messages({
      'string.isoDate': 'Invalid time format. Use YYYY-MM-DDTHH:mm',
      'any.required': 'The date is mandatory',
    }),
})
  .or('volume', 'date')
  .messages({
    'object.missing': 'At least one field to update must be specified',
  });
