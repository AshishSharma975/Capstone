import * as k8sApi from "@kubernetes/client-node";

const kc = new k8sApi.KubeConfig();
kc.loadFromDefault();

console.log("Current Cluster:", kc.getCurrentCluster());

export const k8sCoreV1Api = kc.makeApiClient(k8sApi.CoreV1Api);