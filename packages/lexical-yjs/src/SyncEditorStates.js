/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {
  NodeKey,
  EditorState,
  IntentionallyMarkedAsDirtyElement,
} from 'lexical';
import type {Binding, Provider, YjsEvent} from '.';

// $FlowFixMe: need Flow typings for yjs
import {
  YTextEvent,
  YMapEvent,
  YXmlEvent,
  Map as YMap,
  Array as YArray,
} from 'yjs';
import {
  $isTextNode,
  $getSelection,
  $getRoot,
  $setSelection,
  $getNodeByKey,
  isDecoratorArray,
  isDecoratorMap,
} from 'lexical';
import {CollabElementNode} from './CollabElementNode';
import {CollabTextNode} from './CollabTextNode';
import {
  getOrInitCollabNodeFromSharedType,
  doesSelectionNeedRecovering,
  syncWithTransaction,
} from './Utils';
import {
  syncLexicalSelectionToYjs,
  syncLocalCursorPosition,
  syncCursorPositions,
} from './SyncCursors';
import {CollabDecoratorNode} from './CollabDecoratorNode';
import {$createOffsetView} from '@lexical/helpers/offsets';
import {$createParagraphNode} from 'lexical/ParagraphNode';
import {
  mutationFromCollab,
  syncYjsDecoratorMapToLexical,
  syncYjsDecoratorArrayValueToLexical,
} from './SyncDecoratorStates';

function syncEvent(
  binding: Binding,
  event: YTextEvent | YMapEvent | YXmlEvent,
): void {
  const {target} = event;
  const collabNode = getOrInitCollabNodeFromSharedType(binding, target);
  // $FlowFixMe: internal field
  const decoratorStateValue = target._lexicalValue;

  // Check if this event relates to a decorator state change.
  if (
    decoratorStateValue !== undefined &&
    collabNode instanceof CollabDecoratorNode
  ) {
    if (target instanceof YMap) {
      // Sync decorator state value
      syncYjsDecoratorMapToLexical(
        binding,
        collabNode,
        target,
        decoratorStateValue,
        event.keysChanged,
      );
    } else if (
      target instanceof YArray &&
      isDecoratorArray(decoratorStateValue)
    ) {
      // Sync decorator state value
      const deltas = event.delta;
      let offset = 0;
      for (let i = 0; i < deltas.length; i++) {
        const delta = deltas[i];
        const retainOp = delta.retain;
        const deleteOp = delta.delete;
        const insertOp = delta.insert;

        if (retainOp !== undefined) {
          offset += retainOp;
        } else if (deleteOp !== undefined) {
          mutationFromCollab(() => {
            const elements = decoratorStateValue._array.slice(
              offset,
              offset + deleteOp,
            );
            elements.forEach((element) => {
              if (isDecoratorArray(element) || isDecoratorMap(element)) {
                element.destroy();
              }
            });
            decoratorStateValue.splice(offset, deleteOp);
          });
        } else if (insertOp !== undefined) {
          syncYjsDecoratorArrayValueToLexical(
            binding,
            collabNode,
            target,
            decoratorStateValue,
            offset,
          );
        } else {
          throw new Error('Not supported');
        }
      }
    }
    return;
  }

  if (collabNode instanceof CollabElementNode && event instanceof YTextEvent) {
    const {keysChanged, childListChanged, delta} = event;
    // Update
    if (keysChanged.size > 0) {
      collabNode.syncPropertiesFromYjs(binding, keysChanged);
    }
    if (childListChanged) {
      collabNode.applyChildrenYjsDelta(binding, delta);
      collabNode.syncChildrenFromYjs(binding);
    }
  } else if (
    collabNode instanceof CollabTextNode &&
    event instanceof YMapEvent
  ) {
    const {keysChanged} = event;
    // Update
    if (keysChanged.size > 0) {
      collabNode.syncPropertiesAndTextFromYjs(binding, keysChanged);
    }
  } else if (
    collabNode instanceof CollabDecoratorNode &&
    event instanceof YXmlEvent
  ) {
    const {attributesChanged} = event;
    // Update
    if (attributesChanged.size > 0) {
      collabNode.syncPropertiesFromYjs(binding, attributesChanged);
    }
  } else {
    throw new Error('Should never happen');
  }
}

export function syncYjsChangesToLexical(
  binding: Binding,
  provider: Provider,
  events: Array<YjsEvent>,
): void {
  const editor = binding.editor;
  const currentEditorState = editor._editorState;
  editor.update(
    () => {
      // $FlowFixMe: this is always true
      const pendingEditorState: EditorState = editor._pendingEditorState;
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        syncEvent(binding, event);
      }

      const selection = $getSelection();
      if (selection !== null) {
        // We can't use Yjs's cursor position here, as it doesn't always
        // handle selection recovery correctly – especially on elements that
        // get moved around or split. So instead, we roll our own solution.
        if (doesSelectionNeedRecovering(selection)) {
          const prevSelection = currentEditorState._selection;
          if (prevSelection !== null) {
            const prevOffsetView = $createOffsetView(
              editor,
              0,
              currentEditorState,
            );
            const nextOffsetView = $createOffsetView(
              editor,
              0,
              pendingEditorState,
            );
            const [start, end] =
              prevOffsetView.getOffsetsFromSelection(prevSelection);
            const nextSelection = nextOffsetView.createSelectionFromOffsets(
              start,
              end,
              prevOffsetView,
            );
            if (nextSelection !== null) {
              $setSelection(nextSelection);
            } else {
              // Fallback is to use the Yjs cursor position
              syncLocalCursorPosition(binding, provider);
              if (doesSelectionNeedRecovering(selection)) {
                const root = $getRoot();
                // If there was a collision on the top level paragraph
                // we need to re-add a paragraph
                if (root.getChildrenSize() === 0) {
                  root.append($createParagraphNode());
                }
                // Fallback
                $getRoot().selectEnd();
              }
            }
          }
          syncLexicalSelectionToYjs(
            binding,
            provider,
            prevSelection,
            $getSelection(),
          );
        } else {
          syncLocalCursorPosition(binding, provider);
        }
      }
    },
    {
      onUpdate: () => {
        syncCursorPositions(binding, provider);
      },
      skipTransforms: true,
      tag: 'collaboration',
    },
  );
}

function handleNormalizationMergeConflicts(
  binding: Binding,
  normalizedNodes: Set<NodeKey>,
): void {
  // We handle the merge opperations here
  const normalizedNodesKeys = Array.from(normalizedNodes);
  const collabNodeMap = binding.collabNodeMap;
  const mergedNodes = [];
  for (let i = 0; i < normalizedNodesKeys.length; i++) {
    const nodeKey = normalizedNodesKeys[i];
    const lexicalNode = $getNodeByKey(nodeKey);
    const collabNode = collabNodeMap.get(nodeKey);
    if (collabNode instanceof CollabTextNode) {
      if ($isTextNode(lexicalNode)) {
        // We mutate the text collab nodes after removing
        // all the dead nodes first, otherwise offsets break.
        mergedNodes.push([collabNode, lexicalNode.__text]);
      } else {
        const offset = collabNode.getOffset();
        if (offset === -1) {
          continue;
        }
        const parent = collabNode._parent;
        collabNode._normalized = true;
        parent._xmlText.delete(offset, 1);
        collabNodeMap.delete(nodeKey);
        const parentChildren = parent._children;
        const index = parentChildren.indexOf(collabNode);
        parentChildren.splice(index, 1);
      }
    }
  }
  for (let i = 0; i < mergedNodes.length; i++) {
    const [collabNode, text] = mergedNodes[i];
    collabNode._text = text;
  }
}

export function syncLexicalUpdateToYjs(
  binding: Binding,
  provider: Provider,
  prevEditorState: EditorState,
  currEditorState: EditorState,
  dirtyElements: Map<NodeKey, IntentionallyMarkedAsDirtyElement>,
  dirtyLeaves: Set<NodeKey>,
  normalizedNodes: Set<NodeKey>,
  tags: Set<string>,
): void {
  syncWithTransaction(binding, () => {
    currEditorState.read(() => {
      // We check if the update has come from a origin where the origin
      // was the collaboration binding previously. This can help us
      // prevent unecessarily re-diffing and possible re-applying
      // the same change editor state again. For example, if a user
      // types a character and we get it, we don't want to then insert
      // the same character again. The exception to this heuristic is
      // when we need to handle normalization merge conflicts.
      if (tags.has('collaboration')) {
        if (normalizedNodes.size > 0) {
          handleNormalizationMergeConflicts(binding, normalizedNodes);
        }
        return;
      }
      if (dirtyElements.has('root')) {
        const prevNodeMap = prevEditorState._nodeMap;
        const nextLexicalRoot = $getRoot();
        const collabRoot = binding.root;
        collabRoot.syncPropertiesFromLexical(
          binding,
          nextLexicalRoot,
          prevNodeMap,
        );
        collabRoot.syncChildrenFromLexical(
          binding,
          nextLexicalRoot,
          prevNodeMap,
          dirtyElements,
          dirtyLeaves,
        );
      }
      const selection = $getSelection();
      const prevSelection = prevEditorState._selection;
      syncLexicalSelectionToYjs(binding, provider, prevSelection, selection);
    });
  });
}
