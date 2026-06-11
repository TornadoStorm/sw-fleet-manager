"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { useEffect } from "react";

export function AuthSessionBootstrap() {
    const initSession = useAuthStore((state) => state.initSession);

    useEffect(() => {
        void initSession();
    }, [initSession]);

    return null;
}