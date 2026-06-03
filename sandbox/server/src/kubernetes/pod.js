import { k8sCoreV1Api } from "./config.js";


export async function createPod(sandboxId) {
    const podManifest = {
        metadata: {
            name: `sandbox-pod-${sandboxId}`,
            labels: {
                app: 'sandbox',
                sandboxId: sandboxId.toString()
            }
        },
        spec: {
            containers: [{
                name: `sandbox-container-${sandboxId}`,
                imagePullPolicy: "IfNotPresent",
                image: "template",
                ports: [
                    {
                        containerPort: 5173,
                        name: "http"
                    }
                ],
                resources:{
                    requests:{
                        cpu:"250m",
                        memory:"200Mi"
                    },
                    limits:{
                        cpu:"500m",
                        memory:"400Mi"
                    }
                },
            }]
        }
    }


    const response = await k8sCoreV1Api.createNamespacedPod({
        namespace:"default",
        body: podManifest
    })

    return response;   
}
