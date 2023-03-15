import { z } from 'zod';
import { rest } from 'msw';
import { server } from '../../test/mocks/api/server';
import { Api, ApiError } from './api';
import { mockCma, validServiceKeyFile, validServiceKeyId } from '../../test/mocks';
import { mockAccountSummary } from '../../test/mocks/api/mockData';
import { ContentfulContext } from 'types';
import { fetchFromApi } from 'apis/fetchApi';
// import { runReportData } from '../../../lambda/public/sampleData/MockData';

export const runReportData = {
  dimensionHeaders: [
    {
      name: 'date',
    },
  ],
  metricHeaders: [
    {
      name: 'screenPageViews',
      type: 'TYPE_INTEGER',
    },
  ],
  rows: [
    {
      dimensionValues: [
        {
          value: '20230215',
          oneValue: 'value',
        },
      ],
      metricValues: [
        {
          value: '25',
          oneValue: 'value',
        },
      ],
    },
    {
      dimensionValues: [
        {
          value: '20230216',
          oneValue: 'value',
        },
      ],
      metricValues: [
        {
          value: '9',
          oneValue: 'value',
        },
      ],
    },
    {
      dimensionValues: [
        {
          value: '20230217',
          oneValue: 'value',
        },
      ],
      metricValues: [
        {
          value: '51',
          oneValue: 'value',
        },
      ],
    },
    {
      dimensionValues: [
        {
          value: '20230218',
          oneValue: 'value',
        },
      ],
      metricValues: [
        {
          value: '25',
          oneValue: 'value',
        },
      ],
    },
    {
      dimensionValues: [
        {
          value: '20230219',
          oneValue: 'value',
        },
      ],
      metricValues: [
        {
          value: '5',
          oneValue: 'value',
        },
      ],
    },
    {
      dimensionValues: [
        {
          value: '20230220',
          oneValue: 'value',
        },
      ],
      metricValues: [
        {
          value: '42',
          oneValue: 'value',
        },
      ],
    },
    {
      dimensionValues: [
        {
          value: '20230221',
          oneValue: 'value',
        },
      ],
      metricValues: [
        {
          value: '6',
          oneValue: 'value',
        },
      ],
    },
    {
      dimensionValues: [
        {
          value: '20230222',
          oneValue: 'value',
        },
      ],
      metricValues: [
        {
          value: '18',
          oneValue: 'value',
        },
      ],
    },
    {
      dimensionValues: [
        {
          value: '20230223',
          oneValue: 'value',
        },
      ],
      metricValues: [
        {
          value: '14',
          oneValue: 'value',
        },
      ],
    },
  ],
  totals: [],
  maximums: [],
  minimums: [],
  rowCount: 9,
  metadata: {
    dataLossFromOtherRow: false,
    currencyCode: 'USD',
    _currencyCode: 'currencyCode',
    timeZone: 'Europe/Berlin',
    _timeZone: 'timeZone',
  },
  propertyQuota: null,
  kind: 'analyticsData#runReport',
};


describe('fetchFromApi()', () => {
  const ZSomeSchema = z.object({ foo: z.string() });
  type SomeSchema = z.infer<typeof ZSomeSchema>;
  const url = new URL('http://example.com/foo');
  const contentfulContext = {
    app: 'appDefinitionId',
    contentType: 'contentType',
    entry: 'entryId',
    environment: 'environmentId',
    field: 'fieldId',
    location: 'app-config',
    organization: 'organizationId',
    space: 'spaceId',
    user: 'userId',
  };

  beforeEach(() => {
    server.use(
      rest.get(url.toString(), (_req, res, ctx) => {
        return res(ctx.json({ foo: 'bar' }));
      })
    );
  });

  it('returns the correctly typed data', async () => {
    const result = await fetchFromApi<SomeSchema>(url, ZSomeSchema, contentfulContext.app, mockCma);
    expect(result).toEqual(expect.objectContaining({ foo: 'bar' }));
  });

  // See https://developer.mozilla.org/en-US/docs/Web/API/fetch#exceptions
  describe('when fetch throws a TypeError', () => {
    beforeEach(() => {
      jest.spyOn(global, 'fetch').mockRejectedValue(new TypeError('boom!'));
    });
    afterEach(() => {
      jest.spyOn(global, 'fetch').mockRestore();
    });

    it('throws an ApiServerError', async () => {
      await expect(
        fetchFromApi<SomeSchema>(url, ZSomeSchema, contentfulContext.app, mockCma)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('when a server error occurs', () => {
    beforeEach(() => {
      server.use(
        rest.get(url.toString(), (_req, res, ctx) => {
          return res(ctx.status(500), ctx.body('Boom!'));
        })
      );
    });

    it('throws an ApiServerError', async () => {
      await expect(
        fetchFromApi<SomeSchema>(url, ZSomeSchema, contentfulContext.app, mockCma)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('when a client error occurs', () => {
    beforeEach(() => {
      server.use(
        rest.get(url.toString(), (_req, res, ctx) => {
          return res(ctx.status(400), ctx.body('Boom!'));
        })
      );
    });

    it('throws an ApiClientError', async () => {
      await expect(
        fetchFromApi<SomeSchema>(url, ZSomeSchema, contentfulContext.app, mockCma)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('when the response does not parse against the schema', () => {
    beforeEach(() => {
      server.use(
        rest.get(url.toString(), (_req, res, ctx) => {
          return res(ctx.json({ bar: 'baz' }));
        })
      );
    });

    it('throws an ApiError', async () => {
      await expect(
        fetchFromApi<SomeSchema>(url, ZSomeSchema, contentfulContext.app, mockCma)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('when bad JSON is sent', () => {
    beforeEach(() => {
      server.use(
        rest.get(url.toString(), (_req, res, ctx) => {
          return res(ctx.body('not json!'));
        })
      );
    });

    it('throws an ApiError', async () => {
      await expect(
        fetchFromApi<SomeSchema>(url, ZSomeSchema, contentfulContext.app, mockCma)
      ).rejects.toThrow(ApiError);
    });
  });
});

// Note: mocked http responses are set up using msw in tests/mocks/api/handler
describe('Api', () => {
  describe('getCredentials()', () => {
    const contentfulContext = {
      app: 'appDefinitionId',
      contentType: 'contentType',
      entry: 'entryId',
      environment: 'environmentId',
      field: 'fieldId',
      location: 'app-config',
      organization: 'organizationId',
      space: 'spaceId',
      user: 'userId',
    };

    it('calls fetchApi with the correct parameters', async () => {
      const api = new Api(contentfulContext, mockCma, validServiceKeyId, validServiceKeyFile);
      const result = await api.getCredentials();
      expect(result).toEqual(expect.objectContaining({ status: 'active' }));
    });
  });

  describe('listAccountSummaries()', () => {
    const contentfulContext: ContentfulContext = {
      app: 'appDefinitionId',
      contentType: 'contentType',
      entry: 'entryId',
      environment: 'environmentId',
      environmentAlias: 'master',
      field: 'fieldId',
      location: 'app-config',
      organization: 'organizationId',
      space: 'spaceId',
      user: 'userId',
    };

    it('returns a set of credentials', async () => {
      const api = new Api(contentfulContext, mockCma, validServiceKeyId, validServiceKeyFile);
      const result = await api.listAccountSummaries();
      expect(result).toEqual(expect.arrayContaining([expect.objectContaining(mockAccountSummary)]));
    });
  });

  describe('getRunReportData()', () => {
    const contentfulContext: ContentfulContext = {
      app: 'appDefinitionId',
      contentType: 'contentType',
      entry: 'entryId',
      environment: 'environmentId',
      environmentAlias: 'master',
      field: 'fieldId',
      location: 'app-config',
      organization: 'organizationId',
      space: 'spaceId',
      user: 'userId',
    };

    it('returns a set of data from ga4', async () => {
      const api = new Api(contentfulContext, mockCma, validServiceKeyId, validServiceKeyFile);
      const result = await api.getRunReportData();
      expect(result).toEqual(runReportData);
    });
  });
});
