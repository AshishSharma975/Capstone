import { k8sCoreV1Api } from "./config.js";

export async function cleanupOldSandboxes(keepCount = 1) {
    try {
        console.log("Running sandbox cleanup...");
        // 1. Fetch all sandbox pods
        const podsResponse = await k8sCoreV1Api.listNamespacedPod({
            namespace: "default",
            labelSelector: "app=sandbox"
        });
        const pods = podsResponse.items;
        
        // 2. Fetch all sandbox services
        const svcResponse = await k8sCoreV1Api.listNamespacedService({
            namespace: "default",
            labelSelector: "app=sandbox"
        });
        const services = svcResponse.items;
        
        // Sort pods by creation time (descending - newest first)
        pods.sort((a, b) => {
            return new Date(b.metadata.creationTimestamp).getTime() - new Date(a.metadata.creationTimestamp).getTime();
        });

        // Determine which pods to delete (skip the first `keepCount` pods)
        const podsToDelete = pods.slice(keepCount);
        const activeSandboxIds = new Set(pods.slice(0, keepCount).map(p => p.metadata.labels.sandboxId));

        for (const pod of podsToDelete) {
            console.log(`Deleting old pod: ${pod.metadata.name}`);
            try {
                await k8sCoreV1Api.deleteNamespacedPod({
                    name: pod.metadata.name,
                    namespace: "default"
                });
            } catch (err) {
                console.error(`Failed to delete pod ${pod.metadata.name}:`, err.message);
            }
        }

        for (const svc of services) {
            const sandboxId = svc.metadata.labels.sandboxId;
            if (!activeSandboxIds.has(sandboxId)) {
                console.log(`Deleting old service: ${svc.metadata.name}`);
                try {
                    await k8sCoreV1Api.deleteNamespacedService({
                        name: svc.metadata.name,
                        namespace: "default"
                    });
                } catch (err) {
                    console.error(`Failed to delete service ${svc.metadata.name}:`, err.message);
                }
            }
        }
        
        console.log("Cleanup complete.");
    } catch (error) {
        console.error("Error during sandbox cleanup:", error);
    }
}
