/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const prometheusDurationUnits = ['ms', 's', 'm', 'h', 'd', 'w', 'y'];

export const prometheusDocumentationWebsite =
  '[Prometheus Documentation](https://prometheus.io/docs/prometheus/latest/querying/basics/)';

export const enum PromQLSuggestionItemDescriptions {
  LABEL = 'label',
  VALUE = 'value',
  DURATION = 'duration unit',
  FUNCTION = 'function',
  AGGREGATION_OPERATOR = 'aggregation operator',
  KEYWORD = 'keyword',
}

export const functionNames = [
  // Arithmetic Functions
  { name: 'abs', description: 'Returns the absolute value of each sample.' },
  { name: 'ceil', description: 'Rounds each sample up to the nearest integer.' },
  { name: 'clamp', description: 'Restricts each sample to a specified range.' },
  { name: 'clamp_max', description: 'Restricts each sample to a maximum value.' },
  { name: 'clamp_min', description: 'Restricts each sample to a minimum value.' },
  { name: 'exp', description: 'Calculates the exponential function of each sample.' },
  { name: 'floor', description: 'Rounds each sample down to the nearest integer.' },
  { name: 'ln', description: 'Calculates the natural logarithm of each sample.' },
  { name: 'log10', description: 'Calculates the base-10 logarithm of each sample.' },
  { name: 'log2', description: 'Calculates the base-2 logarithm of each sample.' },
  { name: 'round', description: 'Rounds each sample to the nearest integer.' },
  { name: 'sgn', description: 'Determines the sign of each sample.' },
  { name: 'sqrt', description: 'Calculates the square root of each sample.' },

  // Trigonometric Functions
  { name: 'acos', description: 'Calculates the arc cosine of each sample.' },
  { name: 'acosh', description: 'Calculates the inverse hyperbolic cosine of each sample.' },
  { name: 'asin', description: 'Calculates the arc sine of each sample.' },
  { name: 'asinh', description: 'Calculates the inverse hyperbolic sine of each sample.' },
  { name: 'atan', description: 'Calculates the arc tangent of each sample.' },
  { name: 'atanh', description: 'Calculates the inverse hyperbolic tangent of each sample.' },
  { name: 'cos', description: 'Calculates the cosine of each sample.' },
  { name: 'cosh', description: 'Calculates the hyperbolic cosine of each sample.' },
  { name: 'sin', description: 'Calculates the sine of each sample.' },
  { name: 'sinh', description: 'Calculates the hyperbolic sine of each sample.' },
  { name: 'tan', description: 'Calculates the tangent of each sample.' },
  { name: 'tanh', description: 'Calculates the hyperbolic tangent of each sample.' },
  { name: 'deg', description: 'Converts radians to degrees.' },
  { name: 'pi', description: 'Returns the value of π.' },
  { name: 'rad', description: 'Converts degrees to radians.' },

  // Time Functions
  { name: 'day_of_month', description: 'Returns the day of the month for each timestamp.' },
  { name: 'day_of_week', description: 'Returns the day of the week for each timestamp.' },
  { name: 'day_of_year', description: 'Returns the day of the year for each timestamp.' },
  {
    name: 'days_in_month',
    description: 'Returns the number of days in the month for each timestamp.',
  },
  { name: 'hour', description: 'Returns the hour of the day for each timestamp.' },
  { name: 'minute', description: 'Returns the minute of the hour for each timestamp.' },
  { name: 'month', description: 'Returns the month for each timestamp.' },
  { name: 'year', description: 'Returns the year for each timestamp.' },
  { name: 'time', description: 'Returns the current time as a scalar.' },
  { name: 'timestamp', description: 'Returns the timestamp of each sample.' },

  // Histogram Functions (Experimental)
  { name: 'histogram_avg', description: 'Calculates the average value from histogram buckets.' },
  {
    name: 'histogram_count',
    description: 'Returns the count of observations in histogram buckets.',
  },
  { name: 'histogram_sum', description: 'Returns the sum of observations in histogram buckets.' },
  {
    name: 'histogram_fraction',
    description: 'Calculates the fraction of observations in specified histogram buckets.',
  },
  { name: 'histogram_quantile', description: 'Estimates a quantile value from histogram buckets.' },
  {
    name: 'histogram_stddev',
    description: 'Calculates the standard deviation from histogram buckets.',
  },
  { name: 'histogram_stdvar', description: 'Calculates the variance from histogram buckets.' },

  // Rate and Derivative Functions
  { name: 'rate', description: 'Calculates the per-second average rate of increase.' },
  {
    name: 'irate',
    description:
      'Calculates the per-second instant rate of increase based on the last two data points.',
  },
  { name: 'increase', description: 'Calculates the total increase over a specified time range.' },
  {
    name: 'delta',
    description: 'Calculates the difference between the first and last value over a time range.',
  },
  {
    name: 'idelta',
    description: 'Calculates the difference between the last two samples in a time range.',
  },
  { name: 'deriv', description: 'Calculates the per-second derivative using linear regression.' },
  {
    name: 'predict_linear',
    description: 'Predicts the value at a future time based on linear regression.',
  },
  { name: 'resets', description: 'Counts the number of times a counter resets.' },
  { name: 'changes', description: 'Counts the number of times a value changes.' },

  // Aggregation Over Time Functions
  { name: 'avg_over_time', description: 'Calculates the average value over a time range.' },
  { name: 'min_over_time', description: 'Calculates the minimum value over a time range.' },
  { name: 'max_over_time', description: 'Calculates the maximum value over a time range.' },
  { name: 'sum_over_time', description: 'Calculates the sum of values over a time range.' },
  { name: 'count_over_time', description: 'Counts the number of samples over a time range.' },
  { name: 'quantile_over_time', description: 'Calculates a quantile over a time range.' },
  { name: 'stddev_over_time', description: 'Calculates the standard deviation over a time range.' },
  { name: 'stdvar_over_time', description: 'Calculates the variance over a time range.' },
  { name: 'last_over_time', description: 'Returns the last sample value over a time range.' },
  {
    name: 'absent_over_time',
    description: 'Returns 1 if no data exists over a time range; otherwise, returns nothing.',
  },
  {
    name: 'present_over_time',
    description: 'Returns 1 if data exists over a time range; otherwise, returns nothing.',
  },
  {
    name: 'mad_over_time',
    description: 'Calculates the median absolute deviation over a time range.',
  },

  // Label and Metadata Functions
  { name: 'label_join', description: 'Joins label values into a new label.' },
  { name: 'label_replace', description: 'Replaces label values using a regular expression.' },
  { name: 'info', description: 'Adds metadata labels from info metrics to time series.' }, // Experimental

  // Sorting Functions
  { name: 'sort', description: 'Sorts series by their sample values in ascending order.' },
  { name: 'sort_desc', description: 'Sorts series by their sample values in descending order.' },
  { name: 'sort_by_label', description: 'Sorts series by the specified label in ascending order.' },
  {
    name: 'sort_by_label_desc',
    description: 'Sorts series by the specified label in descending order.',
  },

  // Special Functions
  { name: 'absent', description: 'Returns 1 if no series exist; otherwise, returns nothing.' },
  { name: 'scalar', description: 'Converts a vector with one element into a scalar.' },
  { name: 'vector', description: 'Converts a scalar into a vector with one element.' },

  // Forecasting Function (Experimental)
  {
    name: 'double_exponential_smoothing',
    description: 'Applies double exponential smoothing for forecasting.',
  },
];

export const aggregationOperators = [
  { name: 'sum', description: 'Calculates the sum of all values in each group.' },
  { name: 'min', description: 'Selects the minimum value within each group.' },
  { name: 'max', description: 'Selects the maximum value within each group.' },
  { name: 'avg', description: 'Calculates the average (arithmetic mean) value of each group.' },
  { name: 'group', description: 'Groups time series without aggregating their values.' },
  { name: 'stddev', description: 'Calculates the standard deviation of values in each group.' },
  { name: 'stdvar', description: 'Calculates the variance of values in each group.' },
  { name: 'count', description: 'Counts the number of elements in each group.' },
  { name: 'count_values', description: 'Counts the number of occurrences of each distinct value.' },
  { name: 'bottomk', description: 'Selects the smallest k series by value.' },
  { name: 'topk', description: 'Selects the largest k series by value.' },
  { name: 'quantile', description: 'Calculates a quantile across the values in each group.' },
  {
    name: 'limitk',
    description: 'Selects k series based on a specified aggregation and sorting order.',
  },
  {
    name: 'limit_ratio',
    description: 'Limits the number of series per group by a ratio threshold.',
  },
];
