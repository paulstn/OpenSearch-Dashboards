/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Default date format used across Field Stats components
 * Format: Nov 7, 2025 @ 12:45:23.031
 */
export const DEFAULT_DATE_FORMAT = 'MMM D, YYYY @ HH:mm:ss.SSS';

/**
 * Maximum number of concurrent field stats queries allowed.
 *
 * This limit prevents overwhelming the OpenSearch cluster with too many
 * simultaneous queries when loading field statistics. With 10 concurrent
 * queries, the system can efficiently process field statistics while
 * maintaining cluster stability.
 *
 * For a dataset with 100 fields:
 * - Without limiting: 101 queries fire simultaneously (1 total count + 100 field queries)
 * - With limit of 10: Only 10 queries execute at once, remaining queue up
 *
 * This provides:
 * - Protection for the OpenSearch cluster from query overload
 * - Progressive loading for better user experience
 * - Flexibility to adjust based on cluster capacity
 */
export const FIELD_STATS_MAX_CONCURRENT_QUERIES = 10;
