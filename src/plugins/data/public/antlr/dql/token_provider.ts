/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { monaco } from '@osd/monaco';
import { CharStream, CommonTokenStream, ParserRuleContext, TerminalNode, Token } from 'antlr4ng';
import { DQLLexer } from './.generated/DQLLexer';
import { DQLParser } from './.generated/DQLParser';
import { DQLParserVisitor } from './.generated/DQLParserVisitor';

export class DQLState implements monaco.languages.IState {
  clone() {
    return new DQLState();
  }

  equals(other: any) {
    return true;
  }
}

export class DQLTokenProvider implements monaco.languages.TokensProvider {
  getInitialState(): monaco.languages.IState {
    return new DQLState();
  }

  tokenize(line: string, state: monaco.languages.IState): monaco.languages.ILineTokens {
    const inputStream = CharStream.fromString(line);
    const lexer = new DQLLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new DQLParser(tokenStream);
    parser.removeErrorListeners();
    const tree = parser.query();

    const tokenClassifier = new TokenClassifier();
    const tokens = tokenClassifier.visit(tree);

    if (!tokens) {
      throw new Error('yea');
    }

    return {
      tokens: tokens.map((token) => {
        return { startIndex: token.token.start, scopes: token.classification ?? '' };
      }),
      endState: new DQLState(),
    };
  }
}

const classificationSymbols: { [key: number]: string } = {
  [DQLParser.EQ]: 'operator.logical',
  [DQLParser.GT]: 'operator.logical',
  [DQLParser.GE]: 'operator.logical',
  [DQLParser.LT]: 'operator.logical',
  [DQLParser.LE]: 'operator.logical',
  [DQLParser.AND]: 'operator.boolean',
  [DQLParser.OR]: 'operator.boolean',
  [DQLParser.NOT]: 'operator.negate',
  [DQLParser.LPAREN]: 'delimiter.parenthesis',
  [DQLParser.RPAREN]: 'delimiter.parenthesis',
  [DQLParser.PHRASE]: 'string',
};

const classificationRules: { [key: number]: string } = {
  [DQLParser.RULE_tokenSearch]: 'token',
  [DQLParser.RULE_field]: 'variable',
};

interface TokenClassification {
  token: Token;
  classification: string | undefined;
}

// finds the most relevant rule or type for a given token
class TokenClassifier extends DQLParserVisitor<TokenClassification[]> {
  visitTerminal(node: TerminalNode): [TokenClassification] {
    const classification = classificationSymbols[node.getSymbol().type];
    return [{ token: node.getSymbol(), classification }];
  }

  visitChildren(node: ParserRuleContext): TokenClassification[] {
    const combinedTokens: TokenClassification[] = [];
    for (let i = 0; i < node.getChildCount(); i++) {
      const child = node.getChild(i)!;
      const childResult = child.accept(this)!;

      childResult.forEach((res) => {
        if (!res.classification) {
          // set the classification as the first rule encountered from a terminal node
          combinedTokens.push({ ...res, classification: classificationRules[node.ruleIndex] });
        } else {
          combinedTokens.push(res);
        }
      });
    }
    return combinedTokens;
  }
}
