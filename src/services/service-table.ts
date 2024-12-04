import * as use from "@tensorflow-models/universal-sentence-encoder";
import { TableClient } from "@azure/data-tables";
import * as dotenv from "dotenv";

dotenv.config();

// Configuration d'Azure Table Storage
const tableName = dotenv.config().parsed.TABLE_NAME;
const connectionString = dotenv.config().parsed.CONNECTION_STRING;

const tableClient = TableClient.fromConnectionString(
	connectionString,
	tableName,
);

// Fonction pour vectoriser un message
async function vectorizeMessage(message) {
	const model = await use.load();
	const embeddings = await model.embed([message]);
	return embeddings[0].arraySync();
}

// Fonction pour stocker un vecteur dans Azure Table Storage
async function storeVector(partitionKey, rowKey, vector) {
	const entity = {
		partitionKey: partitionKey,
		rowKey: rowKey,
		vector: vector.toString(), // Convertir le vecteur en chaîne de caractères
	};

	await tableClient.createEntity(entity);
	console.log(`Entity ${entity.rowKey} created.`);
	console.log(`Vector ${entity.vector} stored.`);
}

// Fonction pour vectoriser et stocker tous les messages
export async function vectorizeAndStoreMessages(messages: any) {
	for (const lang in messages) {
		for (const section in messages[lang]) {
			for (const key in messages[lang][section]) {
				const message = messages[lang][section][key];
				if (typeof message === "string") {
					const vector = await vectorizeMessage(message);
					const partitionKey = lang;
					const rowKey = `${section}_${key}`;
					await storeVector(partitionKey, rowKey, vector);
				} else if (typeof message === "object") {
					for (const subKey in message) {
						const subMessage = message[subKey];
						if (typeof subMessage === "string") {
							const vector = await vectorizeMessage(subMessage);
							const partitionKey = lang;
							const rowKey = `${section}_${key}_${subKey}`;
							await storeVector(partitionKey, rowKey, vector);
						}
					}
				}
			}
		}
	}
}
