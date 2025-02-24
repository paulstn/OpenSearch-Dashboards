/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { populateStateFromSavedQuery } from './populate_state_from_saved_query';

import { dataPluginMock } from '../../../mocks';
import { DataPublicPluginStart } from '../../../types';
import { SavedQuery } from '../../..';
import { FilterStateStore } from '../../../../common';
import { getFilter } from '../../../query/filter_manager/test_helpers/get_stub_filter';

describe('populateStateFromSavedQuery', () => {
  let dataMock: jest.Mocked<DataPublicPluginStart>;

  const baseSavedQuery: SavedQuery = {
    id: 'test',
    attributes: {
      title: 'test',
      description: 'test',
      query: {
        query: 'test',
        language: 'kuery',
        dataset: {
          id: 'saved-query-dataset',
          title: 'saved-query-dataset',
          type: 'INDEX',
        },
      },
    },
  };

  beforeEach(() => {
    dataMock = dataPluginMock.createStartContract();
    dataMock.query.filterManager.setFilters = jest.fn();
    dataMock.query.filterManager.getGlobalFilters = jest.fn().mockReturnValue([]);
  });

  it('should set query with current dataset', async () => {
    const savedQuery: SavedQuery = {
      ...baseSavedQuery,
    };
    populateStateFromSavedQuery(dataMock.query, savedQuery);
    expect(dataMock.query.queryString.setQuery).toHaveBeenCalledWith({
      ...savedQuery.attributes.query,
      dataset: dataMock.query.queryString.getQuery().dataset,
    });
  });

  it('should set filters', async () => {
    const savedQuery: SavedQuery = {
      ...baseSavedQuery,
    };
    const f1 = getFilter(FilterStateStore.APP_STATE, false, false, 'age', 34);
    savedQuery.attributes.filters = [f1];
    populateStateFromSavedQuery(dataMock.query, savedQuery);
    expect(dataMock.query.queryString.setQuery).toHaveBeenCalled();
    expect(dataMock.query.filterManager.setFilters).toHaveBeenCalledWith([f1]);
  });

  it('should preserve global filters', async () => {
    const globalFilter = getFilter(FilterStateStore.GLOBAL_STATE, false, false, 'age', 34);
    dataMock.query.filterManager.getGlobalFilters = jest.fn().mockReturnValue([globalFilter]);
    const savedQuery: SavedQuery = {
      ...baseSavedQuery,
    };
    const f1 = getFilter(FilterStateStore.APP_STATE, false, false, 'age', 34);
    savedQuery.attributes.filters = [f1];
    populateStateFromSavedQuery(dataMock.query, savedQuery);
    expect(dataMock.query.queryString.setQuery).toHaveBeenCalled();
    expect(dataMock.query.filterManager.setFilters).toHaveBeenCalledWith([globalFilter, f1]);
  });

  it('should update timefilter', async () => {
    const savedQuery: SavedQuery = {
      ...baseSavedQuery,
    };
    savedQuery.attributes.timefilter = {
      from: '2018',
      to: '2019',
      refreshInterval: {
        pause: true,
        value: 10,
      },
    };

    dataMock.query.timefilter.timefilter.setTime = jest.fn();
    dataMock.query.timefilter.timefilter.setRefreshInterval = jest.fn();

    populateStateFromSavedQuery(dataMock.query, savedQuery);

    expect(dataMock.query.timefilter.timefilter.setTime).toHaveBeenCalledWith({
      from: savedQuery.attributes.timefilter.from,
      to: savedQuery.attributes.timefilter.to,
    });
    expect(dataMock.query.timefilter.timefilter.setRefreshInterval).toHaveBeenCalledWith(
      savedQuery.attributes.timefilter.refreshInterval
    );
  });
});
