/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataView as Dataset } from 'src/plugins/data/common';
import { ExploreServices } from '../../../types';
import { SavedExplore } from '../../../saved_explore';
import { TopNavMenuIconData } from '../../../../../navigation/public';
import { ExecutionContextSearch } from '../../../../../expressions';
import { getNewButtonRun, newTopNavData } from './top_nav_new';
import { getOpenButtonRun, openTopNavData } from './top_nav_open';
import { getSaveButtonRun, saveTopNavData } from './top_nav_save';
import { getShareButtonRun, shareTopNavData } from './top_nav_share';
import { getCancelButtonRun, cancelTopNavData } from './top_nav_cancel/top_nav_cancel';
import {
  getSaveAndReturnButtonRun,
  saveAndReturnTopNavData,
} from './top_nav_save_and_return/top_nav_save_and_return';
import { TabState } from '../../../application/utils/state_management/slices';
import { TabDefinition } from '../../../services/tab_registry/tab_registry_service';
import { useClearEditors } from '../../../application/hooks';

export const getTopNavLinks = (
  services: ExploreServices,
  startSyncingQueryStateWithUrl: () => void,
  searchContext: ExecutionContextSearch,
  stateProps: {
    dataset: Dataset | undefined;
    tabState: TabState;
    flavorId: string | null;
    tabDefinition: TabDefinition | undefined;
    activeTabId: string;
  },
  clearEditors: ReturnType<typeof useClearEditors>,
  savedExplore?: SavedExplore
) => {
  const { capabilities, share } = services;

  const recentlyAccessed = services.chrome.recentlyAccessed.get();
  const pageId = savedExplore?.id ?? '';

  const originatingApp =
    recentlyAccessed.length > 0 && recentlyAccessed[0].id === pageId
      ? recentlyAccessed[1].meta?.type
      : undefined;

  // TODO: above needs some updated logic based on what the object is like
  // NOTE: above has some issues with actually keeping track of the most recent page was, excluding current

  const topNavLinks: TopNavMenuIconData[] = [];

  if (capabilities.discover?.save) {
    topNavLinks.push({
      ...saveTopNavData,
      run: getSaveButtonRun(
        services,
        startSyncingQueryStateWithUrl,
        searchContext,
        stateProps,
        savedExplore
      ),
    });
  }

  topNavLinks.push({
    ...openTopNavData,
    run: getOpenButtonRun(services),
  });
  topNavLinks.push({
    ...newTopNavData,
    run: getNewButtonRun(services, clearEditors),
  });

  if (share) {
    topNavLinks.push({
      ...shareTopNavData,
      run: getShareButtonRun(services, savedExplore),
    });
  }

  if (capabilities.discover?.save && originatingApp && originatingApp === 'dashboards') {
    topNavLinks.push({
      ...cancelTopNavData,
      run: getCancelButtonRun(services, originatingApp),
    });

    topNavLinks.push({
      ...saveAndReturnTopNavData,
      run: getSaveAndReturnButtonRun(
        services,
        startSyncingQueryStateWithUrl,
        searchContext,
        stateProps,
        originatingApp,
        savedExplore
      ),
    });
  }

  return topNavLinks;
};
