import { k8sCoreV1Api } from "./config.js";

export const createService = async (sandboxId) => {
    const serviceManifest = {
        metadata: {
            name: `sandbox-service-${sandboxId}`,
            labels:{
                app: 'sandbox',
                sandboxId:sandboxId.toString()
            }
        },
        spec: {
            selector: {
                app: 'sandbox',
                sandboxId:sandboxId.toString()
            },
            ports: [
                {
                    port: 80,
                    targetPort: 5173,
                    name: "http",
                    protocol: "TCP"
                }
            ],
            type: "ClusterIP"
        }
    }


    const response = await k8sCoreV1Api.createNamespacedService({
        namespace: "default",
        body: serviceManifest
    })

    return response;   
}   