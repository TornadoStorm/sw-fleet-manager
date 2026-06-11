interface MockAccount {
    username: string;
    password: string;
    roles: string[];
}

const MOCK_ACCOUNTS: MockAccount[] = [
    {
        username: "user1",
        password: "password",
        roles: ["role1", "role3"],
    },
    {
        username: "user2",
        password: "password",
        roles: ["role2", "role1"],
    },
];

export function findMockAccount(username: string, password: string): Omit<MockAccount, "password"> | null {
    const account = MOCK_ACCOUNTS.find(
        (candidate) => candidate.username === username && candidate.password === password,
    );

    if (!account) {
        return null;
    }

    return {
        username: account.username,
        roles: account.roles,
    };
}