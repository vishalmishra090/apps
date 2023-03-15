import AnalyticsApp from './AnalyticsApp';
import { render, screen } from '@testing-library/react';
// import runReportResponseHasViews from '../../../../../lambda/public/sampleData/runReportResponseHasViews.json';
// import runReportResponseNoView from '../../../../../lambda/public/sampleData/runReportResponseNoViews.json';



const runReportResponseHasViews = {
  "dimensionHeaders": [
    {
      "name": "date"
    }
  ],
  "metricHeaders": [
    {
      "name": "screenPageViews",
      "type": "TYPE_INTEGER"
    }
  ],
  "rows": [
    {
      "dimensionValues": [
        {
          "value": "20230215",
          "oneValue": "value"
        }
      ],
      "metricValues": [
        {
          "value": "25",
          "oneValue": "value"
        }
      ]
    },
    {
      "dimensionValues": [
        {
          "value": "20230216",
          "oneValue": "value"
        }
      ],
      "metricValues": [
        {
          "value": "9",
          "oneValue": "value"
        }
      ]
    },
    {
      "dimensionValues": [
        {
          "value": "20230217",
          "oneValue": "value"
        }
      ],
      "metricValues": [
        {
          "value": "51",
          "oneValue": "value"
        }
      ]
    },
    {
      "dimensionValues": [
        {
          "value": "20230218",
          "oneValue": "value"
        }
      ],
      "metricValues": [
        {
          "value": "25",
          "oneValue": "value"
        }
      ]
    },
    {
      "dimensionValues": [
        {
          "value": "20230219",
          "oneValue": "value"
        }
      ],
      "metricValues": [
        {
          "value": "5",
          "oneValue": "value"
        }
      ]
    },
    {
      "dimensionValues": [
        {
          "value": "20230220",
          "oneValue": "value"
        }
      ],
      "metricValues": [
        {
          "value": "42",
          "oneValue": "value"
        }
      ]
    },
    {
      "dimensionValues": [
        {
          "value": "20230221",
          "oneValue": "value"
        }
      ],
      "metricValues": [
        {
          "value": "6",
          "oneValue": "value"
        }
      ]
    },
    {
      "dimensionValues": [
        {
          "value": "20230222",
          "oneValue": "value"
        }
      ],
      "metricValues": [
        {
          "value": "18",
          "oneValue": "value"
        }
      ]
    },
    {
      "dimensionValues": [
        {
          "value": "20230223",
          "oneValue": "value"
        }
      ],
      "metricValues": [
        {
          "value": "14",
          "oneValue": "value"
        }
      ]
    }
  ],
  "totals": [],
  "maximums": [],
  "minimums": [],
  "rowCount": 9,
  "metadata": {
    "dataLossFromOtherRow": false,
    "currencyCode": "USD",
    "_currencyCode": "currencyCode",
    "timeZone": "Europe/Berlin",
    "_timeZone": "timeZone"
  },
  "propertyQuota": null,
  "kind": "analyticsData#runReport"
}

const runReportResponseNoView = {
  "dimensionHeaders": [
    {
      "name": "date"
    }
  ],
  "metricHeaders": [
    {
      "name": "screenPageViews",
      "type": "TYPE_INTEGER"
    }
  ],
  "rows": [],
  "totals": [],
  "maximums": [],
  "minimums": [],
  "rowCount": 0,
  "metadata": {
    "dataLossFromOtherRow": false,
    "currencyCode": "USD",
    "_currencyCode": "currencyCode",
    "timeZone": "Europe/Berlin",
    "_timeZone": "timeZone"
  },
  "propertyQuota": null,
  "kind": "analyticsData#runReport"
}


jest.mock('@contentful/react-apps-toolkit', () => ({
  useAutoResizer: () => jest.fn(),
  useFieldValue: () => 'fieldValue',
}));

const { findByTestId, getByTestId, getByText, findByText } = screen;

const SELECT_TEST_ID = 'cf-ui-select';
const NOTE_TEST_ID = 'cf-ui-note';

describe('AnalyticsApp', () => {
  it('mounts data', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockImplementation(
        jest.fn(() =>
          Promise.resolve({ ok: true, json: () => Promise.resolve(runReportResponseHasViews) })
        ) as jest.Mock
      );

    render(<AnalyticsApp />);

    const dropdown = await findByTestId(SELECT_TEST_ID);
    const chart = document.querySelector('canvas');

    expect(dropdown).toBeVisible();
    expect(chart).toBeVisible();
  });

  it('mounts with warning message when no data', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockImplementation(
        jest.fn(() =>
          Promise.resolve({ ok: true, json: () => Promise.resolve(runReportResponseNoView) })
        ) as jest.Mock
      );

    render(<AnalyticsApp />);

    const dropdown = await findByTestId(SELECT_TEST_ID);
    const warningNote = getByTestId(NOTE_TEST_ID);
    const noteText = getByText('There are no page views to show for this range');

    expect(dropdown).toBeVisible();
    expect(warningNote).toBeVisible();
    expect(noteText).toBeVisible();
  });

  it('mounts with error message when fetch error thrown', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockImplementation(
        jest.fn(() => Promise.reject({ message: 'mock Api error' })) as jest.Mock
      );

    render(<AnalyticsApp />);

    const dropdown = await findByTestId(SELECT_TEST_ID);
    const errorNote = getByTestId(NOTE_TEST_ID);

    const noteText = await findByText('mock Api error');

    expect(dropdown).toBeVisible();
    expect(errorNote).toBeVisible();
    expect(noteText).toBeVisible();
  });
});
