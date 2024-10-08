/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DatasetService } from './dataset_service';
import { coreMock } from '../../../../../../core/public/mocks';
import { DataStorage } from 'src/plugins/data/common';
import { DataStructure } from '../../../../common';
import { IDataPluginServices } from '../../../types';

describe('DatasetService', () => {
  let service: DatasetService;
  let uiSettings: ReturnType<typeof coreMock.createSetup>['uiSettings'];
  let sessionStorage: DataStorage;
  let mockDataPluginServices: jest.Mocked<IDataPluginServices>;

  beforeEach(() => {
    uiSettings = coreMock.createSetup().uiSettings;
    sessionStorage = new DataStorage(window.sessionStorage, 'opensearchDashboards.');
    mockDataPluginServices = {} as jest.Mocked<IDataPluginServices>;

    service = new DatasetService(uiSettings, sessionStorage);
  });

  const mockResult = {
    id: 'test-structure',
    title: 'Test Structure',
    type: 'test-type',
    children: [{ id: 'child1', title: 'Child 1', type: 'test-type' }],
  };

  const mockPath: DataStructure[] = [{ id: 'root', title: 'Root', type: 'root' }];

  const mockType = {
    id: 'test-type',
    title: 'Test Type',
    meta: { icon: { type: 'test' } },
    toDataset: jest.fn(),
    fetch: jest.fn().mockResolvedValue(mockResult),
    fetchFields: jest.fn(),
    supportedLanguages: jest.fn(),
  };

  test('registerType and getType', () => {
    service.registerType(mockType);
    expect(service.getType('test-type')).toBe(mockType);
  });

  test('getTypes returns all registered types', () => {
    const mockType1 = { id: 'type1', title: 'Type 1', meta: { icon: { type: 'test1' } } };
    const mockType2 = { id: 'type2', title: 'Type 2', meta: { icon: { type: 'test2' } } };

    service.registerType(mockType1 as any);
    service.registerType(mockType2 as any);

    const types = service.getTypes();
    expect(types).toHaveLength(2);
    expect(types).toContainEqual(mockType1);
    expect(types).toContainEqual(mockType2);
  });

  test('fetchOptions caches and returns data structures', async () => {
    service.registerType(mockType);

    const result = await service.fetchOptions(mockDataPluginServices, mockPath, 'test-type');

    expect(result).toEqual({
      id: 'test-structure',
      title: 'Test Structure',
      type: 'test-type',
      children: [{ id: 'child1', title: 'Child 1', type: 'test-type' }],
    });

    const cachedResult = await service.fetchOptions(mockDataPluginServices, mockPath, 'test-type');
    expect(cachedResult).toEqual(result);
    expect(mockType.fetch).toHaveBeenCalledTimes(2);
  });

  test('clear cache', async () => {
    service.registerType(mockType);

    await service.fetchOptions(mockDataPluginServices, mockPath, 'test-type');
    expect(sessionStorage.keys().length === 1);

    service.clearCache();
    expect(sessionStorage.keys().length === 0);
  });

  test('caching object correctly sets last cache time', async () => {
    service.registerType(mockType);

    const time = Date.now();

    Date.now = jest.fn(() => time);

    await service.fetchOptions(mockDataPluginServices, mockPath, 'test-type');

    expect(service.getLastCacheTime()).toEqual(time);
  });
});
