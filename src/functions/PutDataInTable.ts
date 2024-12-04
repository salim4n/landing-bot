import { HttpRequest, HttpResponseInit } from "@azure/functions/types/http";
import { InvocationContext } from "@azure/functions/types/InvocationContext";
import { vectorizeAndStoreMessages } from "../services/service-table";
import { messages } from "../data/data";
import { app } from "@azure/functions";

export async function PutDataInTable(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	context.log(`Http function processed request for url "${request.url}"`);

	const startTime = Date.now(); // Démarrer le timer
	await vectorizeAndStoreMessages(messages);
	const endTime = Date.now();
	const duration = endTime - startTime; // Calculer la durée
	console.log(`Time taken to store vector: ${duration} ms`); // Afficher le temps pris
	return { body: `Data stored in table., time taken: ${duration} ms` };
}

app.http("PutDataInTable", {
	methods: ["GET", "POST"],
	authLevel: "anonymous",
	handler: PutDataInTable,
});
