/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {EditorThemeClasses} from 'lexical';

import './NetLexicalTheme.css';

const theme: EditorThemeClasses = {
  characterLimit: 'NetLexicalTheme__characterLimit',
  code: 'NetLexicalTheme__code',
  codeHighlight: {
    atrule: 'NetLexicalTheme__tokenAttr',
    attr: 'NetLexicalTheme__tokenAttr',
    boolean: 'NetLexicalTheme__tokenProperty',
    builtin: 'NetLexicalTheme__tokenSelector',
    cdata: 'NetLexicalTheme__tokenComment',
    char: 'NetLexicalTheme__tokenSelector',
    class: 'NetLexicalTheme__tokenFunction',
    'class-name': 'NetLexicalTheme__tokenFunction',
    comment: 'NetLexicalTheme__tokenComment',
    constant: 'NetLexicalTheme__tokenProperty',
    deleted: 'NetLexicalTheme__tokenProperty',
    doctype: 'NetLexicalTheme__tokenComment',
    entity: 'NetLexicalTheme__tokenOperator',
    function: 'NetLexicalTheme__tokenFunction',
    important: 'NetLexicalTheme__tokenVariable',
    inserted: 'NetLexicalTheme__tokenSelector',
    keyword: 'NetLexicalTheme__tokenAttr',
    namespace: 'NetLexicalTheme__tokenVariable',
    number: 'NetLexicalTheme__tokenProperty',
    operator: 'NetLexicalTheme__tokenOperator',
    prolog: 'NetLexicalTheme__tokenComment',
    property: 'NetLexicalTheme__tokenProperty',
    punctuation: 'NetLexicalTheme__tokenPunctuation',
    regex: 'NetLexicalTheme__tokenVariable',
    selector: 'NetLexicalTheme__tokenSelector',
    string: 'NetLexicalTheme__tokenSelector',
    symbol: 'NetLexicalTheme__tokenProperty',
    tag: 'NetLexicalTheme__tokenProperty',
    url: 'NetLexicalTheme__tokenOperator',
    variable: 'NetLexicalTheme__tokenVariable',
  },
  hashtag: 'NetLexicalTheme__hashtag',
  heading: {
    h1: 'NetLexicalTheme__h1',
    h2: 'NetLexicalTheme__h2',
    h3: 'NetLexicalTheme__h3',
    h4: 'NetLexicalTheme__h4',
    h5: 'NetLexicalTheme__h5',
  },
  image: 'editor-image',
  link: 'NetLexicalTheme__link',
  list: {
    listitem: 'NetLexicalTheme__listItem',
    nested: {
      listitem: 'NetLexicalTheme__nestedListItem',
    },
    olDepth: [
      'NetLexicalTheme__ol1',
      'NetLexicalTheme__ol2',
      'NetLexicalTheme__ol3',
      'NetLexicalTheme__ol4',
      'NetLexicalTheme__ol5',
    ],
    ul: 'NetLexicalTheme__ul',
  },
  ltr: 'NetLexicalTheme__ltr',
  paragraph: 'NetLexicalTheme__paragraph',
  quote: 'NetLexicalTheme__quote',
  rtl: 'NetLexicalTheme__rtl',
  table: 'NetLexicalTheme__table',
  tableCell: 'NetLexicalTheme__tableCell',
  tableCellHeader: 'NetLexicalTheme__tableCellHeader',
  text: {
    bold: 'NetLexicalTheme__textBold',
    code: 'NetLexicalTheme__textCode',
    italic: 'NetLexicalTheme__textItalic',
    strikethrough: 'NetLexicalTheme__textStrikethrough',
    underline: 'NetLexicalTheme__textUnderline',
    underlineStrikethrough: 'NetLexicalTheme__textUnderlineStrikethrough',
  },
};

export default theme;
