import createHttpError from 'http-errors';
import swaggerUI from 'swagger-ui-express';
import fs from 'node:fs';

import { SWAGGER_PATH } from '../constants/index.js';

export const swaggerDocs = () => {
  try {
    const swaggerDoc = JSON.parse(fs.readFileSync(SWAGGER_PATH).toString());
    return [
      ...swaggerUI.serve,
      swaggerUI.setup(swaggerDoc, {
        customCss: `body, .swagger-ui {
          background-color: #FDFDFD;
          color: #222 !important;
          font-family: 'Inter', sans-serif;
          }
            .swagger-ui .info a {
            font-weight: 600;
            color: #007AFF;
            transition: color 0.2s ease-in-out;
            }
            .swagger-ui .info a:hover {
            color: #005FCC;
            }
            .swagger-ui .scheme-container {
          max-width: 1350px;
          margin: 20px auto;
          border-radius: 12px;
          background-color: #FFFFFF !important;
          border: 1px solid #DCE1E6 !important;
          color: #222 !important;
          padding: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          }
            .swagger-ui .scheme-container select {
          background-color: #F9FAFB !important;
          color: #222 !important;
          border: 1px solid #C7CCD1 !important;
          border-radius: 8px;
          padding: 10px;
          font-size: 14px;
          }
            .swagger-ui .json-schema-2020-12-accordion,
            .swagger-ui .json-schema-2020-12-expand-deep-button {
          background-color: transparent !important;
          color: #007AFF;
          font-weight: 600;
          }
            .swagger-ui .opblock .opblock-section-header {
          background: #F0F6FF;
          border-radius: 10px;
          padding: 12px 18px;
          border-bottom: 1px solid #D1D5DB;
          font-weight: bold;
          font-size: 16px;
          }
          .information-container.wrapper {
          padding: 0;
          }
            .information-container.wrapper .block.col-12 {
          background: linear-gradient(to right, #FFFFFF, #F3F6FA);
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.15);
          padding: 18px;
          margin: 20px 0;
          border-radius: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          }
            .information-container.wrapper .block.col-12 .info {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1A1A1A;
          }
            .swagger-ui input, .swagger-ui textarea {
          border-radius: 8px;
          border: 1px solid #C7CCD1;
          padding: 10px;
          background: #FFFFFF;
          color: #222;
          font-size: 14px;
          transition: all 0.2s ease-in-out;
          }
            .swagger-ui input:focus, .swagger-ui textarea:focus {
          border-color: #007AFF;
          box-shadow: 0 0 6px rgba(0, 122, 255, 0.25);
          }
            .swagger-ui .opblock .opblock-summary-method {
          background: linear-gradient(to right, #00A3FF, #007AFF);
          color: #fff !important;
          font-weight: bold;
          padding: 12px 18px;
          border-radius: 8px;
          font-size: 14px;
          transition: background 0.2s ease-in-out;
          }
            .swagger-ui .opblock .opblock-summary-method:hover {
          background: linear-gradient(to right, #007AFF, #005FCC);
          }
            .swagger-ui .authorize {
          border: 1px solid #00A3FF !important;
          background: #FFFFFF !important;
          color: #00A3FF !important;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: bold;
          transition: all 0.2s ease-in-out;
          }
            .swagger-ui .authorize:hover {
          background: #00A3FF !important;
          color: #FFFFFF !important;
          }`,
      }),
    ];
  } catch (err) {
    console.log(err);
    return (req, res, next) =>
      next(createHttpError(500, "Can't load swagger docs"));
  }
};
