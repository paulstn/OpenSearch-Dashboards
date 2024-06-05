/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useCallback, useMemo } from 'react';
import { EuiComboBox, EuiComboBoxProps, EuiComboBoxSingleSelectionShape } from '@elastic/eui';
import { i18n } from '@osd/i18n';
import { DataSource } from '../../../data_sources/datasource';
import {
  DATA_SELECTOR_DEFAULT_PLACEHOLDER,
  DATA_SELECTOR_REFRESHER_POPOVER_TEXT,
} from '../../../data_sources/constants';
import { DataSelectorRefresher } from '../../../data_sources/datasource_selector/data_selector_refresher';

interface DataSourceGroup {
  groupType: string;
  label: string;
  id: string;
  options: DataSourceOption[];
}

interface DataSourceOption {
  key: string;
  name: string;
  label: string;
  value: string;
  type: string;
  ds: DataSource;
}

interface DataSourceSelectableProps extends Pick<EuiComboBoxProps<unknown>, 'fullWidth'> {
  dataSources: DataSource[];
  onDataSourceSelect: (dataSourceOption: DataSourceOption[]) => void;
  singleSelection?: boolean | EuiComboBoxSingleSelectionShape;
  onGetDataSetError: (error: Error) => void;
  dataSourceOptionList: DataSourceGroup[];
  selectedSources: DataSourceOption[];
  setDataSourceOptionList: (dataSourceList: DataSourceGroup[]) => void;
  onRefresh: () => void;
}

// Mapping function to get the option format for the combo box from the dataSource and dataSet.
const mapToOption = (dataSource: DataSource): DataSourceOption => {
  const baseOption = {
    type: dataSource.getType(),
    name: dataSource.getName(),
    ds: dataSource,
  };
  return {
    ...baseOption,
    label: dataSource.getName(),
    value: dataSource.getName(),
    key: dataSource.getId(),
  };
};

// Function to add or update groups in a reduction process
const addOrUpdateGroup = (
  existingGroups: DataSourceGroup[],
  dataSource: DataSource,
  option: DataSourceOption
) => {
  const metadata = dataSource.getMetadata();
  const groupType = metadata.ui.groupType;
  const groupName =
    metadata.ui.typeLabel ||
    i18n.translate('dataExplorer.dataSourceSelector.defaultGroupTitle', {
      defaultMessage: 'Default Group',
    });

  const group = existingGroups.find((g: DataSourceGroup) => g.id === groupType);
  if (group && !group.options.some((opt) => opt.key === option.key)) {
    group.options.push(option);
  } else {
    existingGroups.push({
      groupType,
      label: groupName,
      options: [option],
      id: metadata.ui.groupType, // id for each group
    });
  }
};

const consolidateDataSourceGroups = (dataSources: DataSource[]) => {
  return dataSources.reduce((dsGroup, item) => {
    // Handle DataSource directly
    const option = mapToOption(item as InstanceType<typeof DataSource>);
    addOrUpdateGroup(dsGroup, item as InstanceType<typeof DataSource>, option);
    return dsGroup;
  }, []);
};

export const DataSourceSelectable: React.FC<DataSourceSelectableProps> = ({
  dataSources, // list of all available datasource connections.
  dataSourceOptionList, // combo box renderable option list derived from dataSources
  selectedSources, // current selected datasource in the form of [{ label: xxx, value: xxx }]
  onDataSourceSelect,
  setDataSourceOptionList,
  onGetDataSetError, //   onGetDataSetError, Callback for handling get data set errors. Ensure it's memoized.
  singleSelection = { asPlainText: true },
  onRefresh,
  ...comboBoxProps
}: DataSourceSelectableProps) => {
  // This effect gets data sets and prepares the datasource list for UI rendering.
  useEffect(() => {
    setDataSourceOptionList(
      consolidateDataSourceGroups(
        dataSources.filter((ds) => !ds.getMetadata().ui.selector.displayDatasetsAsSource)
      )
    );
  }, [dataSources, setDataSourceOptionList]);

  const handleSourceChange = useCallback(
    (selectedOptions: any) => onDataSourceSelect(selectedOptions),
    [onDataSourceSelect]
  );

  const memorizedDataSourceOptionList = useMemo(() => {
    return dataSourceOptionList.map((dsGroup: DataSourceGroup) => {
      return {
        ...dsGroup,
        options: [...dsGroup.options].sort((ds1, ds2) => {
          return ds1.label.localeCompare(ds2.label, undefined, { sensitivity: 'base' });
        }),
      };
    });
  }, [dataSourceOptionList]);

  return (
    <EuiComboBox
      {...comboBoxProps}
      data-test-subj="dataExplorerDSSelect"
      placeholder={i18n.translate('data.datasource.selectADatasource', {
        defaultMessage: DATA_SELECTOR_DEFAULT_PLACEHOLDER,
      })}
      options={memorizedDataSourceOptionList as any}
      selectedOptions={selectedSources as any}
      onChange={handleSourceChange}
      singleSelection={singleSelection}
      isClearable={false}
      append={
        <DataSelectorRefresher
          tooltipText={DATA_SELECTOR_REFRESHER_POPOVER_TEXT}
          onRefresh={onRefresh}
        />
      }
    />
  );
};
