/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_HELA_RPC: string;
    readonly VITE_HLUSD_ADDRESS: string;
    readonly VITE_STREAMMANAGER_ADDRESS: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
