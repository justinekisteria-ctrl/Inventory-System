const express = require('express');

const router = express.Router();

const {
  getActivityHistory,
getCurrentBatch,
} = require('../db/database');

router.get('/', (req, res) => {
  try {
    const currentBatch =
  getCurrentBatch();

const history =
  getActivityHistory().filter(
    item =>
      item.scanMethod === 'EDIT' ||
      item.batchId ===
      currentBatch.batchId
  );

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        'Failed to fetch activity history',
    });
  }
});

module.exports = router;