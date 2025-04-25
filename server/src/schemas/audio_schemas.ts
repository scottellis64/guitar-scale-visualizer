import Joi from 'joi';

export const downloadSchema = Joi.object({
  url: Joi.string().uri().required(),
  format: Joi.string().valid('mp3', 'wav', 'ogg', 'm4a').required()
});

export const convertSchema = Joi.object({
  format: Joi.string().valid('mp3', 'wav', 'ogg', 'm4a').required()
});

export const extractSchema = Joi.object({
  // No additional validation needed for extract endpoint as it only requires a file
}); 