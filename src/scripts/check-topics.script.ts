import { KAFKA_TOPICS, TOPIC_CONFIGURATIONS } from "../kafka/kafka-topics.config";


const summary = Object.entries(TOPIC_CONFIGURATIONS).map(
    ([topic, config]) => ({
        topic,
        partitions: config.numPartitions,
        replication: config.replicationFactor,
    }),
);
console.table(summary);

console.table(Object.values(KAFKA_TOPICS));

const bootstrapServers = process.env.KAFKA_BOOTSTRAP ?? 'kafka:9092';
console.log('Create topics commands, if needed run manually:')
for(const { topic, partitions, replication } of summary) {

    const command = [
        'kafka-topics',
        `--bootstrap-server ${bootstrapServers}`,
        '--create',
        '--if-not-exists',
        `--topic ${topic}`,
        `--partitions ${partitions}`,
        `--replication-factor ${replication}`,
    ].join(' ');
    console.log(command);
}