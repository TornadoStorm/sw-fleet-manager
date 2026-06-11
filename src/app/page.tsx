"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { Button, Card, Heading, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Stack minH="calc(100vh - 4rem)" align="center" justify="center" p={6}>
      <Card.Root w="full" maxW="md" p={6}>
        <Card.Body>
          <Stack gap={4}>
            <Heading size="lg">Fleet Manager</Heading>
            <Text color="fg.muted">Welcome</Text>
            <Stack direction={{ base: "column", sm: "row" }} gap={3}>
              {!isAuthenticated ? (
                <Button colorPalette="blue" onClick={() => router.push("/login")}>
                  Go to login
                </Button>
              ) : null}
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                disabled={!isAuthenticated}
              >
                Open dashboard
              </Button>
            </Stack>
          </Stack>
        </Card.Body>
      </Card.Root>
    </Stack>
  );
}
