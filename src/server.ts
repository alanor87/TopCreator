import {
  ChangeStreamInsertDocument,
  ChangeStreamUpdateDocument,
} from "mongodb";
import { Customer, CustomerAnonymised } from "./db.js";
import { generateMockData, createHash } from "./utils.js";

/** Creation of the anonymised copy of customer data in customers_anonymised collection for insert || change events. */
async function customerAnonymisedCreation(
  data:
    | ChangeStreamInsertDocument<typeof Customer>
    | ChangeStreamUpdateDocument<typeof Customer>
) {
  switch (data.operationType) {
    // Creating anonymised copy of the original client entry in the adjascent anonymised collection.
    case "insert": {
      const customerAnonymised = new CustomerAnonymised(data.fullDocument);
      customerAnonymised.anonymisePrivateData();
      const savedCustomerAnonymised = await customerAnonymised.save();
      
      if (!savedCustomerAnonymised)
        throw Error(`Error while creating anonymised entry : ${data.documentKey._id.toString()}`);

      break;
    }
    // Looking for the corresponding entry in anonymised collection and regenerating hashed versions for entry fields that have changed.
    case "update": {
      if (!data.updateDescription!.updatedFields) return;

      const updatedFields: { [key: string]: any } = Object.entries(
        data.updateDescription!.updatedFields
      ).reduce((acc: { [key: string]: any }, [key, value]: [string, any]) => {
        const updatedValue =
          key === "email"
            ? createHash(value.split("@")[0]) + "@" + value.split("@")[1]
            : createHash(value);
        acc[key] = updatedValue;
        return acc;
      }, {});

      const id = data.documentKey._id.toString();
      const updatedCustomerAnonymised = await CustomerAnonymised.findByIdAndUpdate(
        id,
        updatedFields
      );

      if (!updatedCustomerAnonymised)
        throw Error(`Error while updating anonymised entry : ${id}`);
      break;
    }
    default: {
      break;
    }
  }
}

/** Fake data generation and DB write launch. */
function initDataGeneration() {
  setInterval(() => {
    const batchSize = Math.ceil(Math.random() * 10);
    const customersBatch = Array(batchSize)
      .fill(0)
      .map(generateMockData);
    Customer.insertMany(customersBatch);
  }, 200);
}

/** Initialization of all the functionality routines, also the error boundary. */
function initServer() {
  try {
    Customer.watch().on("change", customerAnonymisedCreation);
    initDataGeneration();
  } catch (error) {
    console.log("Something is wrong : ", error);
  }
}

export { initServer, customerAnonymisedCreation };
