export declare const documentationPath = "docs/Scripting Documentation";
export declare function developmentWorkspace(workspace: string): {
    version: number;
    workspaceId: string;
    documentationSync: boolean;
    documentationPath: string;
};
export declare function syncDocumentation(workspace: string, raw: any, active: () => boolean): Promise<{
    success: boolean;
    path: string;
    fileCount: number;
}>;
