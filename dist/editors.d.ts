import { EditorDescriptor, EditorKey, ResolvedConfig } from './types';
export declare const EDITORS: EditorDescriptor[];
export declare function getEditor(key: EditorKey): EditorDescriptor | undefined;
/**
 * Whether this editor should be marked as "detected" in the picker.
 *
 * Intentionally returns false for:
 *   - "custom" / "none": meta options, not real editors
 *   - terminal editors (vim/nvim/emacs): typically system-bundled on macOS/Linux,
 *     so detection is meaningless — listing them as detected would mislead users
 *     into thinking they're their primary editor.
 *
 * GUI editors are detected via PATH command first, then macOS app bundle as fallback.
 */
export declare function isEditorAvailable(editor: EditorDescriptor): boolean;
export declare function detectAvailableEditors(): Set<EditorKey>;
export declare function openFileInEditor(filePath: string, config: ResolvedConfig): void;
export declare function writeEditorSettings(config: ResolvedConfig): void;
