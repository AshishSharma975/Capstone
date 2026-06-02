import * as k8sApi from "@kubernetes/client-node"

const kc = new k8sApi.KubeConfig();

export const k8sCoreV1Api = kc.makeApiClient(k8sApi.CoreV1Api);

