import { Connection, Message } from "../../src/";
import log from "../../src/log";
import config from "../config";

export const listener = async () => {
    try {
        const key = "anonymous.super.natural";

        const auth = {
            password: config.messagebrokerpassword,
            url: config.messagebrokerurl,
            username: config.messagebrokerusername,
        };

        const connection = new Connection(auth, {
            interval: 1500,
            retries: 50,
        });

        const exhcange = connection.registerExchange(
            "topics_exchange",
            "topic",
            {
                durable: false,
            },
        );
        const queue = connection.registerQueue("somequeue", {
            durable: false,
        });
        await queue.bind(exhcange, key);

        const callback = async (message: Message) => {
            const rountingKey = message.fields!.routingKey;
            log.debug(
                "message received by listener On  routingkey: " +
                    rountingKey +
                    " with content: " +
                    JSON.stringify(message.getContent(), null, 2),
            );
            message.ack();
        };

        await queue.subscribeConsumer(callback, {
            manualAck: false,
            noAck: false,
        });

        setTimeout(async () => {
            // await connection.close();
        }, 5000);
    } catch (error) {
        log.error(error);
    }
};
