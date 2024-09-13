import crypto from "crypto";
const { faker } = require("@faker-js/faker");

/** Fake user data generator. */
function generateMockData() {
  const mockData = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    address: {
      line1: faker.location.streetAddress(),
      line2: faker.location.secondaryAddress(),
      postcode: faker.location.zipCode(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.countryCode(),
    },
    createdAt: faker.date.past().toISOString(), // Generate a past date and convert to ISO string
  };
  return mockData;
}

/** Function for creating 8 [a-zA-Z\\d] symbols length hash for a random length string. */
function createHash(input: string = "", length: number = 8) {
  if (!input.length) return input;

  let hash = crypto
    .createHash("sha256")
    .update(input)
    .digest("hex");

  while (hash.length < length) {
    hash = crypto
      .createHash("sha256")
      .update(hash)
      .digest("hex");
  }

  return hash
    .substring(0, length)
    .split("")
    .map((char, index) => (index % 2 > 0 ? char.toUpperCase() : char))
    .join("");
}

export { createHash, generateMockData };
