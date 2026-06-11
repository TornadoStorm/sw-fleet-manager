"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { Box, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface RedirectIfAuthenticatedProps {
    children: ReactNode;
}

export function RedirectIfAuthenticated({ children }: RedirectIfAuthenticatedProps) {
    const router = useRouter();
    const hydrated = useAuthStore((state) => state.hydrated);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        if (!hydrated || !isAuthenticated) {
            return;
        }

        router.replace("/dashboard");
    }, [hydrated, isAuthenticated, router]);

    if (!hydrated) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minH="50vh">
                <Spinner size="lg" />
            </Box>
        );
    }

    if (isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
