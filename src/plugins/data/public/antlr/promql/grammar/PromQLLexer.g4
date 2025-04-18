/*
 [The "BSD licence"]
 Copyright (c) 2013 Terence Parr
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:
 1. Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
 3. The name of the author may not be used to endorse or promote products
    derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// $antlr-format alignTrailingComments true, columnLimit 150, maxEmptyLinesToKeep 1, reflowComments false, useTab false
// $antlr-format allowShortRulesOnASingleLine true, allowShortBlocksOnASingleLine true, minEmptyLines 0, alignSemicolons ownLine
// $antlr-format alignColons trailing, singleLineOverrulesHangingColon true, alignLexerCommands true, alignLabels true, alignTrailers true

lexer grammar PromQLLexer;

channels {
    WHITESPACE,
    COMMENTS
}

// All keywords in PromQL are case insensitive, it is just function,
// label and metric names that are not.
options {
    caseInsensitive = true;
}

fragment NUMERAL: [0-9]* '.'? [0-9]+;

fragment SCIENTIFIC_NUMBER: NUMERAL ([e] [-+]? [0-9]+)?;

fragment HEXADECIMAL: '0' [x] [0-9a-f]+;

NUMBER: [-+]? NUMERAL | SCIENTIFIC_NUMBER | HEXADECIMAL | 'nan' | 'inf';

STRING: '\'' (~('\'' | '\\') | '\\' .)* '\'' | '"' (~('"' | '\\') | '\\' .)* '"';

// Binary operators

ADD  : '+';
SUB  : '-';
MULT : '*';
DIV  : '/';
MOD  : '%';
POW  : '^';

AND    : 'and';
OR     : 'or';
UNLESS : 'unless';

// Comparison operators

EQ  : '=';
DEQ : '==';
NE  : '!=';
GT  : '>';
LT  : '<';
GE  : '>=';
LE  : '<=';
RE  : '=~';
NRE : '!~';

// Aggregation modifiers

BY      : 'by';
WITHOUT : 'without';

// Join modifiers

ON          : 'on';
IGNORING    : 'ignoring';
GROUP_LEFT  : 'group_left';
GROUP_RIGHT : 'group_right';

OFFSET: 'offset';

BOOL: 'bool';

// Aggregation Operators
AGGREGATION_OPERATOR:
    'sum'
    | 'min'
    | 'max'
    | 'avg'
    | 'group'
    | 'stddev'
    | 'stdvar'
    | 'count'
    | 'count_values'
    | 'bottomk'
    | 'topk'
    | 'quantile'
    | 'limitk'
    | 'limit_ratio'
;

// Function names
FUNCTION options {
    caseInsensitive = false;
}:
    // Arithmetic Functions
    'abs'
    | 'ceil'
    | 'clamp'
    | 'clamp_max'
    | 'clamp_min'
    | 'exp'
    | 'floor'
    | 'ln'
    | 'log10'
    | 'log2'
    | 'round'
    | 'sgn'
    | 'sqrt'
    |

    // Trigonometric Functions
    'acos'
    | 'acosh'
    | 'asin'
    | 'asinh'
    | 'atan'
    | 'atanh'
    | 'cos'
    | 'cosh'
    | 'sin'
    | 'sinh'
    | 'tan'
    | 'tanh'
    | 'deg'
    | 'pi'
    | 'rad'
    |

    // Time Functions
    'day_of_month'
    | 'day_of_week'
    | 'day_of_year'
    | 'days_in_month'
    | 'hour'
    | 'minute'
    | 'month'
    | 'year'
    | 'time'
    | 'timestamp'
    |

    // Histogram Functions (Experimental)
    'histogram_avg'
    | 'histogram_count'
    | 'histogram_sum'
    | 'histogram_fraction'
    | 'histogram_quantile'
    | 'histogram_stddev'
    | 'histogram_stdvar'
    |

    // Rate and Derivative Functions
    'rate'
    | 'irate'
    | 'increase'
    | 'delta'
    | 'idelta'
    | 'deriv'
    | 'predict_linear'
    | 'resets'
    | 'changes'
    |

    // Aggregation Over Time Functions
    'avg_over_time'
    | 'min_over_time'
    | 'max_over_time'
    | 'sum_over_time'
    | 'count_over_time'
    | 'quantile_over_time'
    | 'stddev_over_time'
    | 'stdvar_over_time'
    | 'last_over_time'
    | 'absent_over_time'
    | 'present_over_time'
    | 'mad_over_time'
    |

    // Label and Metadata Functions
    'label_join'
    | 'label_replace'
    | 'info'
    | // Experimental

    // Sorting Functions
    'sort'
    | 'sort_desc'
    | 'sort_by_label'
    | 'sort_by_label_desc'
    |

    // Special Functions
    'absent'
    | 'scalar'
    | 'vector'
    |

    // Forecasting Function (Experimental)
    'double_exponential_smoothing'
;

LEFT_BRACE  : '{';
RIGHT_BRACE : '}';

LEFT_PAREN  : '(';
RIGHT_PAREN : ')';

LEFT_BRACKET  : '[';
RIGHT_BRACKET : ']';

COMMA: ',';

COLON: ':';

AT: '@';

// The proper order (longest to the shortest) must be validated after parsing
DURATION: ([0-9]+ ('ms' | [smhdwy]))+;

METRIC_NAME : [a-z_:] [a-z0-9_:]*;
LABEL_NAME  : [a-z_] [a-z0-9_]*;

WS         : [\r\t\n ]+   -> channel(WHITESPACE);
SL_COMMENT : '#' .*? '\n' -> channel(COMMENTS);