/**
 * Maps backend-computed priority levels to consistent UI styles.
 * PRODUCTION-READY: Standardized HEX colors and visual transforms.
 */
export function getPriorityStyle(priority) {
    if (priority === "HIGH") {
        return {
            background: "#EF4444",
            borderColor: "#F87171",
            glowColor: "rgba(239, 68, 68, 0.6)",
            transform: "scale(1.1)",
            opacity: 1,
            priorityLabel: "HIGH"
        };
    }

    if (priority === "MEDIUM") {
        return {
            background: "#10B981",
            borderColor: "#34D399",
            glowColor: "rgba(16, 185, 129, 0.4)",
            transform: "scale(1.0)",
            opacity: 1,
            priorityLabel: "MEDIUM"
        };
    }

    // LOW Priority
    return {
        background: "#374151",
        borderColor: "#4B5563",
        glowColor: "rgba(75, 85, 99, 0.2)",
        transform: "scale(0.95)",
        opacity: 0.85,
        priorityLabel: "LOW"
    };
}
