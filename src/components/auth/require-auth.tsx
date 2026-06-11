"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { Box, Spinner } from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface RequireAuthProps {
    children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
    const router = useRouter();
    const pathname = usePathname();
    const hydrated = useAuthStore((state) => state.hydrated);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        if (!hydrated) {
            return;
        }

        if (!isAuthenticated) {
            const redirectTo = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
            router.replace(`/login${redirectTo}`);
        }
    }, [hydrated, isAuthenticated, pathname, router]);

    if (!hydrated) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minH="50vh">
                <Spinner size="lg" />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
