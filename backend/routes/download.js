// backend/routes/download.js
// Handles downloading updated Excel file

const express = require('express');
const {
  getAllAssets,
  getHeaders,
  getActivityHistory,
  getCurrentBatch,
} = require('../db/database');
const {
  generateExcelFile,
  generateActivityExcel,
} = require('../utils/excelGenerator');
const { getReportFilename } = require('../utils/monthColumns');

const router = express.Router();

/**
 * GET /api/download
 * Download all assets as an Excel file
 * 
 * Response: Excel file as binary attachment
 */
router.get('/', async (req, res) => {
  try {
    // Get all assets and header metadata from database
    const assets = getAllAssets();
    const headers = getHeaders();

    // Generate Excel file with original header order
    const excelBuffer = await generateExcelFile(assets, headers);

    // Set response headers to trigger download
    const filename = getReportFilename();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );
    res.setHeader(
  'Access-Control-Expose-Headers',
  'Content-Disposition'
);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    // Send the Excel file
    res.send(excelBuffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'File download failed',
    });
  }
});

/**
 * DOWNLOAD ACTIVITY REPORT
 */
router.get(
  '/activity-report',
  async (req, res) => {

    try {

      const currentBatch =
        getCurrentBatch();

      const history =
  getActivityHistory().filter(
    item =>
      item.scanMethod === 'EDIT' ||
      item.batchId === currentBatch.batchId
  );

      const excelBuffer =
        await generateActivityExcel(
          history
        );

      const now = new Date();

const monthYear =
  now.toLocaleDateString(
    'en-US',
    {
      month: 'long',
      year: 'numeric',
    }
  )
  .replace(',', '');

const filename =
  `Activity-History-${monthYear}.xlsx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`
      );

      res.setHeader(
  'Access-Control-Expose-Headers',
  'Content-Disposition'
);

      res.send(excelBuffer);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          'Failed to download activity report',
      });

    }

  }
);

module.exports = router;
