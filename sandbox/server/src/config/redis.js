import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);
const subscriber = new Redis(process.env.REDIS_URL);


export async function createSandboxKey(sandboxId) {
    await redis.set(`sandbox:${sandboxId}`, JSON.stringify({
        status:'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }),"EX",120)
}

subscriber.config('SET','notify-keyspace-events','Ex');

subscriber.subscribe('__keyevent@0__:expired')

subscriber.on('message', (channel, key) => {
    if (channel === '__keyevent@0__:expired') {
        console.log('EXPIRED KEY EVENT:', key);
    }
});


export  { redis, subscriber}