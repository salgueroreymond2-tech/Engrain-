const errorResponse = {
  type: "object",
  required: ["success", "error", "meta"],
  properties: {
    success: { type: "boolean", example: false },
    error: {
      type: "object",
      properties: {
        code: { type: "string", example: "VALIDATION_ERROR" },
        message: { type: "string" },
        details: { type: "array", items: { type: "object" } }
      }
    },
    meta: { type: "object", properties: { requestId: { type: "string" } } }
  }
};

const bearer = [{ bearerAuth: [] }];

export const openapiDocument = {
  openapi: "3.0.3",
  info: {
    title: "ENGRAIN API",
    version: "1.0.0-mvp",
    description: "Driving Trust: API for vehicle history, workshop evidence and OBD2 diagnostics."
  },
  servers: [{ url: "/api/v1", description: "Current server" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
    },
    schemas: {
      Error: errorResponse,
      Health: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              service: { type: "string", example: "engrain-api" },
              status: { type: "string", example: "ok" },
              timestamp: { type: "string", format: "date-time" }
            }
          }
        }
      },
      VehicleInput: {
        type: "object",
        required: ["vin", "make", "model", "year"],
        properties: {
          vin: { type: "string", example: "1HGCM82633A004352" },
          plate: { type: "string", example: "ABC123" },
          make: { type: "string", example: "Honda" },
          model: { type: "string", example: "Accord" },
          year: { type: "integer", example: 2020 },
          mileageKm: { type: "integer", example: 72000 },
          dataSource: { type: "string", enum: ["MANUAL", "OBD2", "WORKSHOP", "AGENCY", "IMPORTED"] }
        }
      }
    }
  },
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: { "200": { description: "Service available", content: { "application/json": { schema: { $ref: "#/components/schemas/Health" } } } }
      }
    },
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register an owner account",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name", "email", "password"], properties: { name: { type: "string" }, email: { type: "string", format: "email" }, password: { type: "string", format: "password", minLength: 8 } } } } },
        responses: { "201": { description: "Account created" }, "409": { description: "Email already exists" } }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Get an access token",
        responses: { "200": { description: "Authenticated" }, "401": { description: "Invalid credentials" } }
      }
    },
    "/auth/me": {
      get: { tags: ["Authentication"], security: bearer, summary: "Get current profile", responses: { "200": { description: "Current user" }, "401": { description: "Invalid token" } } }
    },
    "/vehicles": {
      get: { tags: ["Vehicles"], security: bearer, summary: "List caller vehicles", responses: { "200": { description: "Vehicle collection" } } },
      post: { tags: ["Vehicles"], security: bearer, summary: "Create a vehicle", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/VehicleInput" } } } }, responses: { "201": { description: "Vehicle created" }, "422": { description: "Invalid input" } } }
    },
    "/vehicles/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: { tags: ["Vehicles"], security: bearer, summary: "Get an owned vehicle", responses: { "200": { description: "Vehicle" }, "404": { description: "Not found" } } },
      patch: { tags: ["Vehicles"], security: bearer, summary: "Update an owned vehicle", responses: { "200": { description: "Vehicle updated" }, "422": { description: "Invalid input" } } },
      delete: { tags: ["Vehicles"], security: bearer, summary: "Archive an owned vehicle", responses: { "204": { description: "Archived" } } }
    }
  }
};
