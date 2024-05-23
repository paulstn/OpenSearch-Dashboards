/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataSourcePluginSetup } from 'src/plugins/data_source/public';
import { i18n } from '@osd/i18n';
import {
  AppMountParameters,
  CoreSetup,
  CoreStart,
  DEFAULT_APP_CATEGORIES,
  Plugin,
} from '../../../core/public';

import { PLUGIN_ID, PLUGIN_NAME } from '../common';
import { createDataSourceSelector } from './components/data_source_selector/create_data_source_selector';

import { IndexPatternManagementSetup } from '../../index_pattern_management/public';
import { DataSourceColumn } from './components/data_source_column/data_source_column';
import {
  AuthenticationMethod,
  IAuthenticationMethodRegistry,
  AuthenticationMethodRegistry,
} from './auth_registry';
import { noAuthCredentialAuthMethod, sigV4AuthMethod, usernamePasswordAuthMethod } from './types';
import { DataSourceSelectorProps } from './components/data_source_selector/data_source_selector';
import { createDataSourceMenu } from './components/data_source_menu/create_data_source_menu';
import { DataSourceMenuProps } from './components/data_source_menu';
import { setApplication, setHideLocalCluster, setUiSettings } from './components/utils';

export interface DataSourceManagementSetupDependencies {
  indexPatternManagement: IndexPatternManagementSetup;
  dataSource: DataSourcePluginSetup;
}

export interface DataSourceManagementPluginSetup {
  registerAuthenticationMethod: (authMethodValues: AuthenticationMethod) => void;
  ui: {
    DataSourceSelector: React.ComponentType<DataSourceSelectorProps>;
    getDataSourceMenu: <T>() => React.ComponentType<DataSourceMenuProps<T>>;
  };
}

export interface DataSourceManagementPluginStart {
  getAuthenticationMethodRegistry: () => IAuthenticationMethodRegistry;
}

// src/plugins/workspace/public/plugin.ts Workspace depends on this ID and hard code to avoid adding dependency on DSM bundle.
export const DSM_APP_ID = 'dataSources';

export class DataSourceManagementPlugin
  implements
    Plugin<
      DataSourceManagementPluginSetup,
      DataSourceManagementPluginStart,
      DataSourceManagementSetupDependencies
    > {
  private started = false;
  private authMethodsRegistry = new AuthenticationMethodRegistry();

  private title = i18n.translate('dataSourcesManagement.title', {
    defaultMessage: 'Data Sources (obs)', // TODO: change with PLUGIN_TITLE
  });

  public setup(
    core: CoreSetup<DataSourceManagementPluginStart>,
    { indexPatternManagement, dataSource }: DataSourceManagementSetupDependencies
  ) {
    core.application.register({
      id: PLUGIN_ID,
      title: this.title,
      order: 9030,
      icon: '/ui/logos/opensearch_mark.svg',
      category: DEFAULT_APP_CATEGORIES.management,
      async mount(params: AppMountParameters) {
        const { renderApp } = await import('./application');
        // const [coreStart] = await core.getStartServices();

        return renderApp(params);
      },
    });

    const uiSettings = core.uiSettings;

    const savedObjectPromise = core
      .getStartServices()
      .then(([coreStart]) => coreStart.savedObjects);

    const column = new DataSourceColumn(savedObjectPromise);
    indexPatternManagement.columns.register(column);

    const registerAuthenticationMethod = (authMethod: AuthenticationMethod) => {
      if (this.started) {
        throw new Error(
          'cannot call `registerAuthenticationMethod` after data source management startup.'
        );
      }
      this.authMethodsRegistry.registerAuthenticationMethod(authMethod);
    };

    if (dataSource.noAuthenticationTypeEnabled) {
      registerAuthenticationMethod(noAuthCredentialAuthMethod);
    }
    if (dataSource.usernamePasswordAuthEnabled) {
      registerAuthenticationMethod(usernamePasswordAuthMethod);
    }
    if (dataSource.awsSigV4AuthEnabled) {
      registerAuthenticationMethod(sigV4AuthMethod);
    }

    setHideLocalCluster({ enabled: dataSource.hideLocalCluster });
    setUiSettings(uiSettings);

    return {
      registerAuthenticationMethod,
      ui: {
        DataSourceSelector: createDataSourceSelector(uiSettings, dataSource),
        getDataSourceMenu: <T>() => createDataSourceMenu<T>(),
      },
    };
  }

  public start(core: CoreStart) {
    this.started = true;
    setApplication(core.application);
    return {
      getAuthenticationMethodRegistry: () => this.authMethodsRegistry,
    };
  }

  public stop() {}
}
