/** Protocol v1 used older names. Keep that transport detail out of the public
 * script/skill vocabulary while remaining usable with already released Apps. */
export declare function scriptMethod(method: string): string;
export declare function wireMethod(method: string): string;
export declare function scriptCapabilities(values: string[]): string[];
export declare function scriptError(value: any): any;
/** Only protocol-owned result headers are renamed; never rewrite Script.exit
 * values, user logs, diagnostics, filenames or other script-owned data. */
export declare function scriptResult(value: any): any;
