/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { i18n } from '@osd/i18n';
import { TopNavMenuIconRun, TopNavMenuIconUIData } from '../types';
import { ExploreServices } from '../../../../types';
import { ExecutionContextSearch } from '../../../../../../expressions';
import { SavedExplore } from '../../../../saved_explore';
import { saveSavedExplore } from '../../../../helpers/save_explore';
import { SaveStateProps } from '../top_nav_save/top_nav_save';
import { saveStateToSavedObject } from '../../../../saved_explore/transforms';
import { getVisualizationBuilder } from '../../../visualizations/visualization_builder';

export const saveAndReturnTopNavData: TopNavMenuIconUIData = {
  tooltip: i18n.translate('explore.topNav.saveAndReturnButtonTooltip', {
    defaultMessage: 'Save and return',
  }),
  ariaLabel: i18n.translate('explore.topNav.saveAndReturnButtonAriaLabel', {
    defaultMessage: 'Finish editing and return to the last app',
  }),
  testId: 'exploreSaveAndReturnButton',
  iconType: 'checkInCircleFilled',
  controlType: 'icon',
};

export const getSaveAndReturnButtonRun = (
  services: ExploreServices,
  startSyncingQueryStateWithUrl: () => void,
  searchContext: ExecutionContextSearch,
  saveStateProps: SaveStateProps,
  originatingApp: string | undefined,
  savedExplore?: SavedExplore
): TopNavMenuIconRun => async () => {
  if (!savedExplore) return;

  // Save
  const visualizationBuilder = getVisualizationBuilder();
  const visConfig = visualizationBuilder.visConfig$.value;
  const axesMapping = visConfig?.axesMapping;
  const savedExploreWithState = saveStateToSavedObject(
    savedExplore,
    saveStateProps.flavorId ?? 'logs',
    saveStateProps.tabDefinition!,
    { axesMapping, chartType: visConfig?.type, styleOptions: visConfig?.styles },
    saveStateProps.dataset,
    saveStateProps.activeTabId
  );
  await saveSavedExplore({
    savedExplore: savedExploreWithState,
    newTitle: savedExplore.title,
    saveOptions: { isTitleDuplicateConfirmed: false, onTitleDuplicate: () => {} },
    searchContext,
    services,
    startSyncingQueryStateWithUrl,
    openAfterSave: true,
    newCopyOnSave: false, // save to the same savedExplore
  });

  // Navigate
  if (originatingApp) {
    services.core.application.navigateToApp(originatingApp);
  }
};
