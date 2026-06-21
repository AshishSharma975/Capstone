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
                    image: "template:v2",
                    imagePullPolicy: "IfNotPresent",

                    command: ["/bin/sh", "-c"],
                    args: [
                        "cp -r /template/. /workspace && cd /workspace && npm run dev -- --host 0.0.0.0"
                    ],

                    volumeMounts: [
                        {
                            name: "workspace-volume",
                            mountPath: "/workspace",
                        },
                    ],

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
                    name: "agent-container",
                    image: "agent:v2",
                    imagePullPolicy: "IfNotPresent",

                    ports: [
                        {
                            containerPort: 8080,
                            name: "http",
                        },
                    ],

                    volumeMounts: [
                        {
                            name: "workspace-volume",
                            mountPath: "/workspace",
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
            ],
        },
    };

    const response = await k8sCoreV1Api.createNamespacedPod({
        namespace: "default",
        body: podManifest,
    });

    return response;
}