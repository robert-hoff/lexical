/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

export type SettingName =
  | 'disableBeforeInput'
  | 'measureTypingPerf'
  | 'isRichText'
  | 'isCollab'
  | 'isCharLimit'
  | 'isCharLimitUtf8'
  | 'isAutocomplete'
  | 'showTreeView'
  | 'showNestedEditorTreeView'
  | 'emptyEditor';

export type Settings = {[SettingName]: boolean};

// $FlowExpectedError
// const hostName = window.location.hostname;
// export const isDevPlayground: boolean = hostName !== 'playground.lexical.dev' && hostName !== 'lexical-playground.vercel.app';
export const isDevPlayground: boolean = false;

export const DEFAULT_SETTINGS: Settings = {
  disableBeforeInput: false,
  // emptyEditor: isDevPlayground, // if false here we get some content already supplied (deleted this)
  emptyEditor: true,
  isAutocomplete: false,
  isCharLimit: false,
  isCharLimitUtf8: false,
  isCollab: false,
  isRichText: true,
  measureTypingPerf: false,
  showNestedEditorTreeView: false,
  showTreeView: true,
};
