"use client";

import { RequireAuth } from "@/components/auth/require-auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Badge, Button, Card, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    return (
        <RequireAuth>
            <Stack minH="calc(100vh - 4rem)" align="center" justify="center" p={6}>
                <Card.Root w="full" maxW="md" p={6}>
                    <Card.Body>
                        <Stack gap={4}>
                            <Heading size="lg">Authenticated User</Heading>
                            <Text>
                                Username: <Text as="span" fontWeight="bold">{user?.username}</Text>
                            </Text>
                            <Stack gap={2}>
                                <Text fontWeight="medium">Roles</Text>
                                <HStack wrap="wrap" gap={2}>
                                    {user?.roles?.map((role) => (
                                        <Badge key={role} colorPalette="blue">
                                            {role}
                                        </Badge>
                                    ))}
                                </HStack>
                            </Stack>
                            <Button alignSelf="flex-start" variant="outline" onClick={() => void handleLogout()}>
                                Log out
                            </Button>
                        </Stack>
                    </Card.Body>
                </Card.Root>
            </Stack>
        </RequireAuth>
    );
}
