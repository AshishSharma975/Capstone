import { k8sCoreV1Api } from "./config.js";

export async function createPod(sandboxId, projectId) {
    const syncServerUrl = process.env.KUBERNETES_SERVICE_HOST
        ? "http://main-sandbox-service"
        : "http://host.docker.internal:5000";

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
                    image: "agent:v4",
                    imagePullPolicy: "IfNotPresent",
                    ports: [
                        {
                            containerPort: 8080,
                            name: "http",
                        },
                    ],

                    env: [
                        { name: "PROJECT_ID", value: projectId || "" },
                        { name: "SYNC_SERVER_URL", value: syncServerUrl } 
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

                {
                    name: "sync-agent-container",
                    image: "sync-agent",
                    imagePullPolicy: "IfNotPresent",

                    env: [
                        { name: "PROJECT_ID", value: projectId || "" },
                        { name: "SYNC_SERVER_URL", value: syncServerUrl } 
                    ],

                    volumeMounts: [
                        {
                            name: "workspace-volume",
                            mountPath: "/workspace",
                        },
                    ],

                    resources: {
                        requests: {
                            cpu: "100m",
                            memory: "100Mi",
                        },
                        limits: {
                            cpu: "250m",
                            memory: "250Mi",
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


export async function deletePod(sandboxId) {
    const podManifest = {
        metadata: {
            name: `sandbox-pod-${sandboxId}`,
        },
        gracePeriodSeconds: 0,
    };

    const response = await k8sCoreV1Api.deleteNamespacedPod({
        namespace: "default",
        body: podManifest,
        
    });

    return response;
}