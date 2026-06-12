'use client';

import type { AuthUser, ManageableStarshipsResponse, StarshipWithMetadata } from '@/lib/auth/types';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Combobox,
  createListCollection,
  DataList,
  Dialog,
  Heading,
  HStack,
  Input,
  Menu,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

const DEBOUNCE_MS = 300;

interface StarshipsDashboardProps {
  user: AuthUser;
  response: ManageableStarshipsResponse;
  searchParams: Record<string, string | string[] | undefined>;
}

interface FilterOption {
  label: string;
  value: string;
}

interface FilterComboboxProps {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

interface MetadataDialogProps {
  triggerLabel: string;
  title: string;
  subtitle: string;
  entries: Array<[string, unknown]>;
}

function prettifyMetadataKey(key: string): string {
  return key
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function toDisplayValue(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'None';
    }

    return value.join(', ');
  }

  if (value === null || value === undefined || value === '') {
    return 'Unknown';
  }

  return String(value);
}

function getModelName(starship: StarshipWithMetadata): string {
  return starship.modelMetadata?.model ?? `Model #${starship.modelId}`;
}

function getLocationName(starship: StarshipWithMetadata): string {
  return starship.locationMetadata?.name ?? `Location #${starship.location}`;
}

function getUserInitials(fullname: string): string {
  const words = fullname.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return '?';
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

function buildMetadataEntries<T extends object>(metadata: T | null, excludedKeys: Set<string>) {
  if (!metadata) {
    return [];
  }

  return Object.entries(metadata as Record<string, unknown>).filter(
    ([key]) => !excludedKeys.has(key),
  );
}

function FilterCombobox({ label, placeholder, value, options, onChange }: FilterComboboxProps) {
  const collection = useMemo(
    () =>
      createListCollection<FilterOption>({
        items: options.map((option) => ({ label: option, value: option })),
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
      }),
    [options],
  );

  return (
    <Combobox.Root
      collection={collection}
      value={value ? [value] : []}
      inputValue={value}
      openOnClick
      closeOnSelect
      onInputValueChange={(details) => onChange(details.inputValue)}
      onValueChange={(details) => onChange(details.value[0] ?? '')}
    >
      <Combobox.Control>
        <Combobox.Input asChild>
          <Input aria-label={label} placeholder={placeholder} />
        </Combobox.Input>
        <Combobox.IndicatorGroup>
          <Combobox.ClearTrigger />
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Combobox.Positioner>
        <Combobox.Content>
          <Combobox.Empty>No matching options.</Combobox.Empty>
          <Combobox.List>
            {collection.items.map((item) => (
              <Combobox.Item key={item.value} item={item}>
                <Combobox.ItemText>{item.label}</Combobox.ItemText>
                <Combobox.ItemIndicator />
              </Combobox.Item>
            ))}
          </Combobox.List>
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Root>
  );
}

function MetadataDialog({ triggerLabel, title, subtitle, entries }: MetadataDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="ghost" justifyContent="flex-start" p={0} h="auto">
          {triggerLabel}
        </Button>
      </Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Stack gap={1}>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Description>{subtitle}</Dialog.Description>
            </Stack>
          </Dialog.Header>
          <Dialog.Body>
            {entries.length === 0 ? (
              <Text fontSize="sm">No additional metadata available.</Text>
            ) : (
              <DataList.Root
                minW="sm"
                display="grid"
                gridTemplateColumns="repeat(2, minmax(0, 1fr))"
                gap={3}
              >
                {entries.map(([key, value]) => (
                  <DataList.Item key={key} display="flex" flexDirection="column" gap={1}>
                    <DataList.ItemLabel>{prettifyMetadataKey(key)}</DataList.ItemLabel>
                    <DataList.ItemValue>{toDisplayValue(value)}</DataList.ItemValue>
                  </DataList.Item>
                ))}
              </DataList.Root>
            )}
          </Dialog.Body>
          <Dialog.CloseTrigger />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

export function StarshipsDashboard({ user, response, searchParams }: StarshipsDashboardProps) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const { items: starships, pagination } = response;

  // Initialize filter state from URL search params
  const [search, setSearch] = useState(
    Array.isArray(searchParams.search) ? searchParams.search[0] : (searchParams.search ?? ''),
  );
  const [fleet, setFleet] = useState(
    Array.isArray(searchParams.fleet) ? searchParams.fleet[0] : (searchParams.fleet ?? ''),
  );
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [debouncedFleet, setDebouncedFleet] = useState(fleet);

  // Debounce search input
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [search]);

  // Debounce fleet input
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedFleet(fleet);
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [fleet]);

  // Update URL when debounced values change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (debouncedFleet) params.set('fleet', debouncedFleet);
    router.push(`/dashboard?${params.toString()}`);
  }, [debouncedSearch, debouncedFleet, router]);

  // Build unique fleet options from current page items
  const fleetOptions = useMemo(() => {
    return Array.from(new Set(starships.map((starship) => starship.fleet))).sort((left, right) =>
      left.localeCompare(right),
    );
  }, [starships]);

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearch(newSearch);
  }, []);

  const handleFleetChange = useCallback((newFleet: string) => {
    setFleet(newFleet);
  }, []);

  const handlePreviousPage = useCallback(() => {
    const newOffset = Math.max(0, pagination.offset - pagination.limit);
    const params = new URLSearchParams();
    if (newOffset > 0) params.set('offset', newOffset.toString());
    params.set('limit', pagination.limit.toString());
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (debouncedFleet) params.set('fleet', debouncedFleet);
    router.push(`/dashboard?${params.toString()}`);
  }, [pagination.offset, pagination.limit, debouncedSearch, debouncedFleet, router]);

  const handleNextPage = useCallback(() => {
    if (!pagination.hasMore) return;
    const newOffset = pagination.offset + pagination.limit;
    const params = new URLSearchParams();
    params.set('offset', newOffset.toString());
    params.set('limit', pagination.limit.toString());
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (debouncedFleet) params.set('fleet', debouncedFleet);
    router.push(`/dashboard?${params.toString()}`);
  }, [
    pagination.offset,
    pagination.limit,
    pagination.hasMore,
    debouncedSearch,
    debouncedFleet,
    router,
  ]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  return (
    <Stack minH="calc(100vh - 4rem)" p={{ base: 4, md: 6 }} gap={6}>
      <HStack
        as="nav"
        justify="space-between"
        align="center"
        borderWidth="1px"
        borderRadius="lg"
        px={{ base: 3, md: 4 }}
        py={3}
        bg="bg.subtle"
      >
        <Heading size="md">Fleet Dashboard</Heading>
        <Menu.Root positioning={{ placement: 'bottom-end' }}>
          <Menu.Trigger asChild>
            <Button
              variant="ghost"
              borderRadius="full"
              minW="auto"
              h="auto"
              p={1}
              aria-label="Open account menu"
            >
              <Avatar.Root size="sm">
                <Avatar.Fallback>{getUserInitials(user.fullname)}</Avatar.Fallback>
              </Avatar.Root>
            </Button>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content minW="9rem">
              <Stack px={3} py={2} gap={0.5}>
                <Text fontWeight="semibold">{user.fullname}</Text>
                <Text fontSize="xs" color="fg.muted">
                  {user.username}
                </Text>
                <HStack wrap="wrap" gap={1} mt={1}>
                  {user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <Badge key={role} size="sm" colorPalette="blue" variant="subtle">
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <Badge size="sm" colorPalette="gray" variant="subtle">
                      No roles
                    </Badge>
                  )}
                </HStack>
              </Stack>
              <Menu.Separator />
              <Menu.Item value="logout" onClick={() => void handleLogout()}>
                Log out
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </HStack>

      <Card.Root>
        <Card.Body>
          <Stack gap={4}>
            <Heading size="md">Search and Filters</Heading>
            <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={3}>
              <Input
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search starships, fleets, models, locations"
                aria-label="Search starships"
              />
              <FilterCombobox
                label="Filter by fleet"
                placeholder="Filter fleet"
                value={fleet}
                options={fleetOptions}
                onChange={handleFleetChange}
              />
            </SimpleGrid>
            <Text fontSize="sm" color="fg.muted">
              Showing {starships.length} of {pagination.total} accessible starships.
            </Text>
          </Stack>
        </Card.Body>
      </Card.Root>

      {starships.length === 0 ? (
        <Card.Root>
          <Card.Body>
            <Text>No starships match the current filters.</Text>
          </Card.Body>
        </Card.Root>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
          {starships.map((starship) => {
            const modelEntries = buildMetadataEntries(
              starship.modelMetadata,
              new Set(['created', 'edited', 'url', 'pilots', 'films', 'name', 'model']),
            );
            const locationEntries = buildMetadataEntries(
              starship.locationMetadata,
              new Set(['films', 'created', 'edited', 'url', 'residents', 'name']),
            );

            return (
              <Card.Root
                key={`${starship.fleet}-${starship.title}-${starship.modelId}-${starship.location}`}
              >
                <Card.Header>
                  <Stack gap={1}>
                    <Heading size="md">{starship.title}</Heading>
                    <Text fontSize="sm" color="fg.muted">
                      {starship.fleet}
                    </Text>
                  </Stack>
                </Card.Header>
                <Card.Body>
                  <DataList.Root orientation="horizontal" minW="sm">
                    <DataList.Item>
                      <DataList.ItemLabel>Model</DataList.ItemLabel>
                      <DataList.ItemValue>
                        <MetadataDialog
                          triggerLabel={getModelName(starship)}
                          title={getModelName(starship)}
                          subtitle="Starship"
                          entries={modelEntries}
                        />
                      </DataList.ItemValue>
                    </DataList.Item>
                    <DataList.Item>
                      <DataList.ItemLabel>Location</DataList.ItemLabel>
                      <DataList.ItemValue>
                        <MetadataDialog
                          triggerLabel={getLocationName(starship)}
                          title={getLocationName(starship)}
                          subtitle="Planet"
                          entries={locationEntries}
                        />
                      </DataList.ItemValue>
                    </DataList.Item>
                  </DataList.Root>
                </Card.Body>
              </Card.Root>
            );
          })}
        </SimpleGrid>
      )}

      <HStack justify="space-between" wrap="wrap">
        <Text fontSize="sm" color="fg.muted">
          Page {currentPage} of {totalPages}
        </Text>
        <HStack>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.offset === 0}
            onClick={handlePreviousPage}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasMore}
            onClick={handleNextPage}
          >
            Next
          </Button>
        </HStack>
      </HStack>
    </Stack>
  );
}
