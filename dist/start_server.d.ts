export declare function startServer({ port, noAutoOpen, startBonjourService, editorOverride, reconfigure }: {
    port: number | undefined;
    noAutoOpen: boolean | undefined;
    startBonjourService: boolean | undefined;
    editorOverride?: string | undefined;
    reconfigure?: boolean | undefined;
}): Promise<void>;
