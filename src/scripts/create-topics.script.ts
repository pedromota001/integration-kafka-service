import { Kafka, logLevel } from "kafkajs";
import {
    KAFKA_TOPICS,
    KafkaTopic,
    TOPIC_CONFIGURATIONS,
} from '../kafka/kafka-topics.config';

type TopicConfig = {
    topic: KafkaTopic;
    partitions: number;
    replication: number;
}

function buildTopicList(): TopicConfig[] {
    return (Object.values(KAFKA_TOPICS) as KafkaTopic[]).map((topic) => {
        const config = TOPIC_CONFIGURATIONS[topic];
        if(!config) {
            throw new Error("Topic config is not found for topic: " + topic);
        }
        return {
            topic, 
            partitions: config.numPartitions,
            replication: config.replicationFactor,
        };
    });
}

async function createTopics() {
    const brokers = process.env.KAFKA_BROKERS?.split(',') ?? ['localhost:9092'];
    const kafka = new Kafka({
        clientId: 'kafka-topic-init',
        brokers, 
        logLevel: logLevel.INFO
    });
    const admin = kafka.admin();
    await admin.connect();
    try {
        const topics = buildTopicList();
        const existing = await admin.listTopics();
        const missing = topics.filter((topic) => !existing.includes(topic.topic));
        if(missing.length === 0) {
            console.log('All topics already exist');
            return;
        }

        console.log('Creating missing topics...');
        console.log('Missing topics: ', missing.map((t) => t.topic).join(', '));

        await admin.createTopics({
            topics: missing,
            waitForLeaders: true,
        })
        console.log('Topics have been created successfully');
    } catch(error) {
        console.error('Error creating topics: ', error);
        throw error;
    } finally {
        await admin.disconnect();
    }
}

createTopics().catch((error) => {
    console.error('Fatal error: ', error);
    process.exit(1);
})