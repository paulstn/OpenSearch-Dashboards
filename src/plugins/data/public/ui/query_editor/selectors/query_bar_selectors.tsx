/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFlexGroup, EuiFlexItem, EuiComboBox } from '@elastic/eui';
import React, { useCallback, useEffect, useState } from 'react';
import { i18n } from '@osd/i18n';
import { DataSource, DataSourceGroup, DataSourceOption } from '../../..';
import { useOpenSearchDashboards } from '../../../../../opensearch_dashboards_react/public';
import {
  DataExplorerServices,
  useTypedDispatch,
  useTypedSelector,
} from '../../../../../data_explorer/public';
import { DataSourceSelectable } from './datasource_selectable';
// import { DataSourceSelectable } from '../../../../public/data_sources/datasource_selector';

interface QueryBarSelectorsProps {
  languageSelector: React.JSX.Element;
}

export const QueryBarSelectors = (props: QueryBarSelectorsProps) => {
  const { indexPattern: indexPatternId } = useTypedSelector((state) => state.metadata);
  const dispatch = useTypedDispatch();
  const [selectedSources, setSelectedSources] = useState<DataSourceOption[]>([]);
  const [dataSourceOptionList, setDataSourceOptionList] = useState<DataSourceGroup[]>([]);
  const [activeDataSources, setActiveDataSources] = useState<DataSource[]>([]);

  const [showIndexPatterns, setShowIndexPatterns] = useState(false);

  const {
    services: {
      data: { indexPatterns, dataSources },
      notifications: { toasts },
    },
  } = useOpenSearchDashboards<DataExplorerServices>();

  useEffect(() => {
    let isMounted = true;
    const subscription = dataSources.dataSourceService
      .getDataSources$()
      .subscribe((currentDataSources) => {
        if (isMounted) {
          setActiveDataSources(Object.values(currentDataSources));
        }
      });

    return () => {
      subscription.unsubscribe();
      isMounted = false;
    };
  }, [indexPatterns, dataSources]);

  const getMatchedOption = (dataSourceList: DataSourceGroup[], ipId: string) => {
    for (const dsGroup of dataSourceList) {
      const matchedOption = dsGroup.options.find((item) => item.value === ipId);
      if (matchedOption !== undefined) return matchedOption;
    }
    return undefined;
  };

  useEffect(() => {
    if (indexPatternId) {
      const option = getMatchedOption(dataSourceOptionList, indexPatternId);
      setSelectedSources(option ? [option] : []);
    }
  }, [indexPatternId, activeDataSources, dataSourceOptionList]);

  const handleSourceSelection = useCallback(
    (selectedDataSources: DataSourceOption[]) => {
      setSelectedSources(selectedDataSources);
      if (selectedDataSources.length === 0) {
        return;
      }

      console.log(selectedDataSources);

      // if (selectedDataSources[0].type === 'default') {
      //   // dispatch(setIndexPattern(selectedDataSources[0].value));
      //   // dispatch(setDataSource(selectedDataSources[0].ds));
      // } else {
      //   // dispatch(setDataSource(selectedDataSources[0].ds));
      // }
    },
    [dispatch, setSelectedSources]
  );

  useEffect(() => {
    setShowIndexPatterns(selectedSources[0]?.type === 'default');
    if (selectedSources[0]?.type === 'default') {
    }
  }, [selectedSources]);

  const handleGetDataSetError = useCallback(
    () => (error: Error) => {
      toasts.addError(error, {
        title:
          i18n.translate('dataExplorer.sidebar.failedToGetDataSetErrorDescription', {
            defaultMessage: 'Failed to get data set: ',
          }) + (error.message || error.name),
      });
    },
    [toasts]
  );

  const memorizedReload = useCallback(() => {
    dataSources.dataSourceService.reload();
  }, [dataSources.dataSourceService]);

  return (
    <EuiFlexGroup gutterSize="xs">
      <EuiFlexItem>
        <DataSourceSelectable
          dataSources={activeDataSources}
          dataSourceOptionList={dataSourceOptionList}
          setDataSourceOptionList={setDataSourceOptionList}
          onDataSourceSelect={handleSourceSelection}
          selectedSources={selectedSources}
          onGetDataSetError={handleGetDataSetError}
          onRefresh={memorizedReload}
          fullWidth
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>{props.languageSelector}</EuiFlexItem>
      {showIndexPatterns && (
        <EuiFlexItem>
          <IndexPatternSelector />
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
};
