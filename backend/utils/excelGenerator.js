// backend/utils/excelGenerator.js
// Generates Excel files for download with all current data

const ExcelJS = require('exceljs');
const {
  getMonthlyStatusHeader,
  getMonthlyRemarksHeader,
  isMonthlyRemarksHeader,
  isCurrentMonthRemarksHeader,
  normalizeHeader,
  normalizeHeaderWithoutYear,
} = require('./monthColumns');

function isInternalField(value) {
  return normalizeHeader(value).replace(/\s+/g, '') === 'scanningmonth';
}

function getDisplayHeader(header) {
  return normalizeHeader(header) === 'no change with change'
    ? String(header).replace(/\s*\(\d+\)\s*$/, '')
    : header;
}

function getAssetValue(asset, header) {
  const normalizedHeader = normalizeHeader(header);
  if (isMonthlyRemarksHeader(header)) {
  if (asset[header] !== undefined) {
    return asset[header];
  }

  const matchingKey = Object.keys(asset).find(
    key => normalizeHeader(key) === normalizedHeader
  );

  return matchingKey ? asset[matchingKey] : '';
}

  if (
    normalizedHeader === 'remarks' ||
    (!isMonthlyRemarksHeader(header) && normalizedHeader.endsWith(' remarks')) ||
    isCurrentMonthRemarksHeader(header)
  ) {
    if (asset[header] !== undefined) {
      return asset[header];
    }
    return asset.remarks || asset.REMARKS || asset.Remarks || asset.remark || asset.notes || asset.note || asset.comments || asset.comment || '';
  }

  if (asset[header] !== undefined) {
    return asset[header];
  }

  const matchingKey = Object.keys(asset).find(
    key => normalizeHeader(key) === normalizedHeader
  );

  if (matchingKey) {
    return asset[matchingKey];
  }

  return asset[normalizedHeader] !== undefined ? asset[normalizedHeader] : '';
}

function deriveHeadersFromAssets(assets) {
  const excludedKeys = new Set(['id', 'createdAt', 'updatedAt']);
  const headerSet = new Set();

  assets.forEach(asset => {
    Object.keys(asset).forEach(key => {
      if (!excludedKeys.has(key) && !isInternalField(key)) {
        headerSet.add(key);
      }
    });
  });

  return Array.from(headerSet);
}

async function generateExcelFile(assets, headers = []) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Assets');

    if (!Array.isArray(headers) || headers.length === 0) {
      headers = deriveHeadersFromAssets(assets);
    }

    headers = headers.filter(header => !isInternalField(header));

const monthlyStatusHeader = getMonthlyStatusHeader();
const monthlyRemarksHeader = getMonthlyRemarksHeader();

// convert generic remarks into monthly remarks FIRST
headers = headers.map(header =>
  normalizeHeader(header) === 'remarks'
    ? monthlyRemarksHeader
    : header
);

// remove duplicates
headers = [...new Set(headers)];

const statusExists = headers.some(
  header =>
    normalizeHeader(header) ===
    normalizeHeader(monthlyStatusHeader)
);

const remarksExists = headers.some(
  header =>
    normalizeHeader(header) ===
    normalizeHeader(monthlyRemarksHeader)
);

// append missing current month columns
if (!statusExists) {
  headers.push(monthlyStatusHeader);
}

if (!remarksExists) {
  headers.push(monthlyRemarksHeader);
}

// FORCE STATUS before REMARKS for every month
headers = headers.sort((a, b) => {
  const aNorm = normalizeHeader(a);
  const bNorm = normalizeHeader(b);

  const aIsStatus = aNorm.endsWith(' status');
  const aIsRemarks = aNorm.endsWith(' remarks');

  const bIsStatus = bNorm.endsWith(' status');
  const bIsRemarks = bNorm.endsWith(' remarks');

  // extract month-year part
  const aBase = aNorm
    .replace(/ status$/, '')
    .replace(/ remarks$/, '');

  const bBase = bNorm
    .replace(/ status$/, '')
    .replace(/ remarks$/, '');

  // same month group
  if (aBase === bBase) {
    if (aIsStatus && bIsRemarks) return -1;
    if (aIsRemarks && bIsStatus) return 1;
  }

  return 0;
});

    const normalizedToHeader = headers.reduce((map, header) => {
      map[normalizeHeader(header)] = header;
      return map;
    }, {});

    worksheet.columns = [
      {
        header: '',
        key: '_iterationNumber',
        width: 8,
      },
      ...headers.map(header => ({
        header: getDisplayHeader(header),
        key: header,
        width: Math.max(String(getDisplayHeader(header)).length + 5, 15),
      }))
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '366092' },
    };
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center' };

    assets.forEach((asset, index) => {
      const rowData = {
        _iterationNumber: index + 1
      };
      headers.forEach(header => {
        rowData[header] = getAssetValue(asset, header);
      });

      const row = worksheet.addRow(rowData);
      const statusHeader = normalizedToHeader.status;
      const statusValue = asset.status || (statusHeader ? rowData[statusHeader] : '');

      if (String(statusValue).toUpperCase() === 'ACCOUNTED') {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'C6EFCE' },
        };
      } else if (String(statusValue).toUpperCase() === 'RECONCILING') {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFEB9C' },
        };
      } else {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC7CE' },
        };
      }

      row.alignment = { horizontal: 'left', vertical: 'center' };
    });

    worksheet.columns.forEach(column => {
      column.width = Math.max(15, column.width || 15);
    });

    return await workbook.xlsx.writeBuffer();
  } catch (error) {
    throw new Error(`Excel generation failed: ${error.message}`);
  }
}

async function generateActivityExcel(
  history
) {

  const workbook =
    new ExcelJS.Workbook();

  const worksheet =
    workbook.addWorksheet(
      'Activity History'
    );

  worksheet.columns = [
    {
      header: 'Employee ID',
      key: 'employeeId',
      width: 20,
    },

    {
      header: 'User Name',
      key: 'userName',
      width: 25,
    },

    {
      header: 'Department',
      key: 'department',
      width: 25,
    },

    {
      header: 'Asset',
      key: 'asset',
      width: 20,
    },

    {
      header:
        'Asset Description',
      key: 'assetDescription',
      width: 40,
    },

    {
      header: 'Serial Number',
      key: 'serialNumber',
      width: 30,
    },

    {
      header: 'Scan Method',
      key: 'scanMethod',
      width: 20,
    },

    {
      header: 'Changes',
      key: 'changes',
      width: 60,
    },

    {
      header: 'Date',
      key: 'date',
      width: 20,
    },

    {
      header: 'Time',
      key: 'time',
      width: 20,
    },
  ];

  worksheet.getRow(1).font = {
    bold: true,
    color: { argb: 'FFFFFF' },
  };

  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4F46E5' },
  };

  history.forEach(item => {

    const scanDate =
      new Date(item.scannedAt);

    worksheet.addRow({

      employeeId:
        item.employeeId || '',

      userName:
        item.userName || '',

      department:
        item.department || '',

      asset:
        item.asset || '',

      assetDescription:
        item.assetDescription ||
        '',

      serialNumber:
        item.serialNumber || '',

      scanMethod:
        item.scanMethod || 'QR',

        changes:
  item.changes?.map(
    change =>
      `${change.field}: ${change.oldValue || 'Empty'} → ${change.newValue || 'Empty'}`
  ).join(' | ') || '',

      date:
        scanDate.toLocaleDateString(),

      time:
        scanDate.toLocaleTimeString(),

    });

  });

  return await workbook.xlsx.writeBuffer();

}

module.exports = {
  generateExcelFile,
  generateActivityExcel,
};
