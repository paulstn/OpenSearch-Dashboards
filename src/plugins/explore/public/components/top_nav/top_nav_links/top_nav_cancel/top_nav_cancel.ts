/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { i18n } from '@osd/i18n';
import { TopNavMenuIconRun, TopNavMenuIconUIData } from '../types';
import { ExploreServices } from '../../../../types';

export const cancelTopNavData: TopNavMenuIconUIData = {
  tooltip: i18n.translate('explore.topNavMenu.cancelAndReturnButtonTooltip', {
    defaultMessage: 'Discard your changes before finishing',
  }),
  ariaLabel: i18n.translate('explore.topNavMenu.cancelButtonAriaLabel', {
    defaultMessage: 'Return to the last app without saving changes',
  }),
  testId: 'exploreCancelAndReturnButton',
  iconType: 'cross',
  controlType: 'icon',
};

export const getCancelButtonRun = (
  services: ExploreServices,
  originatingApp: string | undefined
): TopNavMenuIconRun => () => {
  // Navigate back to the originating app
  if (originatingApp) {
    services.core.application.navigateToApp(originatingApp);
  }
};
