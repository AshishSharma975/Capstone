import { k8sCoreV1Api } from "./config.js";

export async function createPod(sandboxId) {
    const podManifest = {
        metadata: {
            name: `sandbox-pod-${sandboxId}`,
            labels: {
                app: "sandbox",
                sandboxId: sandboxId.toString(),
            },
        },
        spec: {
            volumes: [
                {
                    name: "workspace-volume",
                    emptyDir: {},
                },
            ],
            containers: [
                {
                    name: `sandbox-container-${sandboxId}`,
                    imagePullPolicy: "IfNotPresent",
                    image: "template",
                    ports: [
                        {
                            containerPort: 5173,
                            name: "http",
                        },
                    ],
                    resources: {
                        requests: {
                            cpu: "250m",
                            memory: "200Mi",
                        },
                        limits: {
                            cpu: "500m",
                            memory: "400Mi",
                        },
                    },
                },

                {
                    image: "agent",
                    imagePullPolicy: "IfNotPresent",
                    name: "agent-container",
                    ports: [
                        {
                            containerPort: 8080,
                            name: "http",
                        },
                    ],
                    resources: {
                        requests: {
                            cpu: "250m",
                            memory: "200Mi",
                        },
                        limits: {
                            cpu: "500m",
                            memory: "400Mi",
                        },
                    },
                    volumeMounts: [
                        {
                            name: "workspace-volume",
                            mountPath: "/workspace",
                        },
                    ],
                },
            ],
        },
    };

    const response = await k8sCoreV1Api.createNamespacedPod({
        namespace: "default",
        body: podManifest,
    });

    return response;
}