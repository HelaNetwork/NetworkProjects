/**
 * Assigns a semantic score to a file based on its name and path keywords.
 * PRODUCTION-READY: High-value keywords indicate core architectural concerns.
 */
export function getSemanticScore(fileName: string): number {
    const name = fileName.toLowerCase();

    const high = ["auth", "login", "payment", "db", "server", "security", "vault"];
    const medium = ["api", "service", "controller", "handler", "manager", "logic"];
    const low = ["test", "demo", "sample", "temp", "hello", "mock", "spec"];

    let score = 0;

    // Highest importance for security, data, and entry points
    high.forEach(k => {
        if (name.includes(k)) score += 4;
    });

    // Substantial importance for business logic and infrastructure
    medium.forEach(k => {
        if (name.includes(k)) score += 2;
    });

    // Reduced importance for non-productive files
    low.forEach(k => {
        if (name.includes(k)) score -= 2;
    });

    return score;
}
