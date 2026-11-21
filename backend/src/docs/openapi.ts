const bearer = [{ bearerAuth: [] }];

const standardErrors = {
  "401": { description: "Invalid token or revoked session" },
  "403": { description: "Permission denied" },
  "404": { description: "Not found or not visible" },
  "422": { description: "Validation error" },
  "503": { description: "Configured external provider is unavailable" }
};

export const openapiDocument = {
  openapi: "3.0.3",
  info: {
    title: "ENGRAIN API",
    version: "1.1.0-mvp",
    description: "Driving Trust API with organization isolation, vehicle access grants, sessions and shareable passports."
  },
  servers: [{ url: "/api/v1", description: "Current server" }],
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
    schemas: {
      Error: {
        type: "object",
        properties: { success: { type: "boolean", example: false }, error: { type: "object" }, meta: { type: "object" } }
      },
      AuthInput: {
        type: "object",
        required: ["email", "password"],
        properties: { email: { type: "string", format: "email" }, password: { type: "string", format: "password" } }
      },
      VehicleInput: {
        type: "object",
        required: ["vin", "make", "model", "year"],
        properties: {
          vin: { type: "string", example: "1HGCM82633A004352" }, plate: { type: "string", example: "DEMO-001" },
          make: { type: "string", example: "Honda" }, model: { type: "string", example: "Accord" }, year: { type: "integer", example: 2020 },
          mileageKm: { type: "integer", example: 72450 }, dataSource: { type: "string", enum: ["MANUAL", "OBD2", "WORKSHOP", "DEALERSHIP", "IMPORTED"] }
        }
      },
      VehicleAccessGrantInput: {
        type: "object",
        required: ["permission"],
        properties: {
          granteeUserId: { type: "string" }, organizationId: { type: "string" }, workshopId: { type: "string" },
          permission: { type: "string", enum: ["VIEW", "SERVICE", "MANAGE"] }, expiresAt: { type: "string", format: "date-time" }
        },
        description: "Exactly one target identifier is required."
      },
      DiagnosticSimulationInput: {
        type: "object",
        required: ["scenario"],
        properties: { scenario: { type: "string", enum: ["healthy", "misfire", "catalyst", "cooling"], example: "misfire" } },
        description: "Hackathon-only simulated OBD2 reading. The persisted scan is marked isSimulated=true and recordSource=SIMULATED."
      },
      HistoryQuestionInput: {
        type: "object",
        required: ["question"],
        properties: { question: { type: "string", example: "¿Qué códigos requieren revisión?" }, scanId: { type: "string" } }
      },
      PassportInput: {
        type: "object",
        required: ["vehicleId"],
        properties: { vehicleId: { type: "string" }, expiresAt: { type: "string", format: "date-time" } },
        description: "Creates a random, expiring public link. expiresAt defaults to seven days when omitted. snapshot is never exposed by the public endpoint."
      },
      ExternalQueryInput: {
        type: "object",
        properties: {
          providers: { type: "array", items: { type: "string", enum: ["HACIENDA", "INS", "DEKRA", "COSEVI", "REGISTRO_NACIONAL", "MOCK"] } },
          mode: { type: "string", enum: ["MANUAL", "SIMULATED"], default: "MANUAL" }
        },
        description: "MANUAL creates documentation instructions only; no public portal is automated. SIMULATED is super-admin-only and accepts MOCK only."
      },
      PlateExternalQueryInput: {
        allOf: [{ $ref: "#/components/schemas/ExternalQueryInput" }],
        type: "object",
        required: ["plate"],
        properties: {
          plate: { type: "object", required: ["number"], properties: { category: { type: "string", example: "AUTOMOVIL" }, code: { type: "string", example: "A" }, number: { type: "string", example: "123456" } } }
        }
      },
      ManualExternalDocumentInput: {
        type: "object",
        required: ["institution", "type", "fileName", "mimeType", "sizeBytes", "sha256"],
        properties: {
          institution: { type: "string", enum: ["HACIENDA", "INS", "DEKRA", "COSEVI", "REGISTRO_NACIONAL", "MANUAL_DOCUMENT"] },
          type: { type: "string", enum: ["PDF", "IMAGE", "INVOICE", "CERTIFICATE", "REPORT"] },
          fileName: { type: "string", example: "inspection.pdf" }, mimeType: { type: "string", example: "application/pdf" }, sizeBytes: { type: "integer", example: 183002 },
          sha256: { type: "string", pattern: "^[a-fA-F0-9]{64}$" }, sourceReference: { type: "string" }, observedAt: { type: "string", format: "date-time" }, notes: { type: "string" }
        },
        description: "Metadata only. The API never accepts document binaries in this MVP."
      }
    }
  },
  paths: {
    "/health": { get: { tags: ["System"], summary: "Health check", responses: { "200": { description: "Service available" } } } },
    "/auth/register": {
      post: { tags: ["Authentication"], summary: "Register and create a session", requestBody: { required: true, content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/AuthInput" }], properties: { name: { type: "string" } } } } } }, responses: { "201": { description: "Account and session created" }, "409": { description: "Email exists" }, "429": { description: "Rate limited" } } }
    },
    "/auth/login": { post: { tags: ["Authentication"], summary: "Login", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/AuthInput" } } } }, responses: { "200": { description: "Session created" }, "401": { description: "Invalid credentials" }, "429": { description: "Rate limited" } } } },
    "/auth/refresh": { post: { tags: ["Authentication"], summary: "Rotate refresh token", responses: { "200": { description: "Token pair rotated" }, "401": { description: "Invalid refresh token" } } } },
    "/auth/me": { get: { tags: ["Authentication"], security: bearer, summary: "Current profile", responses: { "200": { description: "Profile" }, ...standardErrors } } },
    "/auth/sessions": {
      get: { tags: ["Authentication"], security: bearer, summary: "List own sessions", responses: { "200": { description: "Sessions" }, ...standardErrors } },
      delete: { tags: ["Authentication"], security: bearer, summary: "Use /auth/sessions/{id} to revoke a session", responses: { "405": { description: "Path id required" } } }
    },
    "/auth/sessions/{id}": { delete: { tags: ["Authentication"], security: bearer, summary: "Revoke one owned session", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "204": { description: "Session revoked" }, ...standardErrors } } },
    "/organizations/me": { get: { tags: ["Organizations"], security: bearer, summary: "Active organization memberships", responses: { "200": { description: "Memberships" }, ...standardErrors } } },
    "/organizations": { post: { tags: ["Organizations"], security: bearer, summary: "Create workshop or dealership organization", responses: { "201": { description: "Organization created" }, ...standardErrors } } },
    "/workshops": { post: { tags: ["Workshops"], security: bearer, summary: "Create a workshop for an authorized organization", responses: { "201": { description: "Workshop created" }, ...standardErrors } } },
    "/workshops/{id}/vehicles": { get: { tags: ["Workshops"], security: bearer, summary: "Only vehicles explicitly granted to the workshop", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Authorized vehicle collection" }, ...standardErrors } } },
    "/vehicles": {
      get: { tags: ["Vehicles"], security: bearer, summary: "List only vehicles visible to the caller", responses: { "200": { description: "Vehicle collection" }, ...standardErrors } },
      post: { tags: ["Vehicles"], security: bearer, summary: "Register VIN and initial ownership", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/VehicleInput" } } } }, responses: { "201": { description: "Vehicle created" }, "409": { description: "VIN exists" }, ...standardErrors } }
    },
    "/vehicles/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: { tags: ["Vehicles"], security: bearer, summary: "Get an owned or granted vehicle", responses: { "200": { description: "Vehicle" }, ...standardErrors } },
      patch: { tags: ["Vehicles"], security: bearer, summary: "Update with MANAGE access", responses: { "200": { description: "Vehicle updated" }, ...standardErrors } },
      delete: { tags: ["Vehicles"], security: bearer, summary: "Archive with MANAGE access", responses: { "204": { description: "Archived" }, ...standardErrors } }
    },
    "/vehicles/{id}/access-grants": { post: { tags: ["Vehicle access"], security: bearer, summary: "Grant user, organization or workshop access", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/VehicleAccessGrantInput" } } } }, responses: { "201": { description: "Grant created" }, ...standardErrors } } },
    "/vehicles/{id}/timeline": { get: { tags: ["Vehicles"], security: bearer, summary: "Technical history tied to the vehicle", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Maintenance, diagnostics and mileage" }, ...standardErrors } } },
    "/vehicles/{id}/external-queries": {
      get: { tags: ["External vehicle data"], security: bearer, summary: "List external queries for an owned or MANAGE-authorized vehicle", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "External queries and records" }, ...standardErrors } },
      post: { tags: ["External vehicle data"], security: bearer, summary: "Request responsible external vehicle information", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ExternalQueryInput" } } } }, responses: { "201": { description: "Query, manual instructions or clearly simulated records" }, "429": { description: "20 external queries per authenticated user per hour" }, ...standardErrors } }
    },
    "/external-providers": { get: { tags: ["External vehicle data"], security: bearer, summary: "List provider capability and authorization status", responses: { "200": { description: "Provider registry; not proof that a government integration is active" }, ...standardErrors } } },
    "/external-queries/plate": { post: { tags: ["External vehicle data"], security: bearer, summary: "Super-admin plate query without a vehicle context", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/PlateExternalQueryInput" } } } }, responses: { "201": { description: "Query created" }, "429": { description: "Rate limited" }, ...standardErrors } } },
    "/external-queries/{id}": { get: { tags: ["External vehicle data"], security: bearer, summary: "Read an authorized external query", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Query with provider records and verification logs" }, ...standardErrors } } },
    "/external-queries/{id}/retry": { post: { tags: ["External vehicle data"], security: bearer, summary: "Retry an authorized external query", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "201": { description: "New immutable query attempt" }, "409": { description: "Query is not retryable" }, "429": { description: "Rate limited" }, ...standardErrors } } },
    "/external-queries/{id}/documents": { post: { tags: ["External vehicle data"], security: bearer, summary: "Attach metadata and SHA-256 for an authorized manually obtained document", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ManualExternalDocumentInput" } } } }, responses: { "201": { description: "Manual-document record created; binary remains outside this API" }, ...standardErrors } } },
    "/vehicles/{id}/events": { get: { tags: ["Trust"], security: bearer, summary: "Chronological immutable vehicle trust events", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Events with origin, author, integrity and evidence metadata" }, ...standardErrors } } },
    "/vehicles/{id}/ownerships": { get: { tags: ["Trust"], security: bearer, summary: "Vehicle ownership history", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Historical ownership records" }, ...standardErrors } } },
    "/vehicles/{id}/mileage-logs": { post: { tags: ["Trust"], security: bearer, summary: "Record mileage and flag neutral inconsistencies", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "201": { description: "Mileage log and review signal" }, ...standardErrors } } },
    "/vehicles/{id}/maintenance-records": { post: { tags: ["Trust"], security: bearer, summary: "Create a versioned maintenance record", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "201": { description: "Draft maintenance record" }, ...standardErrors } } },
    "/vehicles/{id}/diagnostics": { get: { tags: ["Engrain Connect"], security: bearer, summary: "List authorized OBD2 diagnostic history with DTC alerts", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Diagnostics; simulated records expose isSimulated=true" }, ...standardErrors } } },
    "/vehicles/{id}/diagnostics/simulations": { post: { tags: ["Engrain Connect"], security: bearer, summary: "Create a clearly marked hackathon OBD2 simulation", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/DiagnosticSimulationInput" } } } }, responses: { "201": { description: "Finalized simulated scan with measurements" }, ...standardErrors } } },
    "/vehicles/{id}/diagnostics/measurements": { get: { tags: ["Engrain Connect"], security: bearer, summary: "Chartable time series for an OBD2 metric", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }, { name: "metric", in: "query", required: true, schema: { type: "string", example: "coolant_temperature" } }, { name: "from", in: "query", schema: { type: "string", format: "date-time" } }, { name: "to", in: "query", schema: { type: "string", format: "date-time" } }, { name: "limit", in: "query", schema: { type: "integer", maximum: 1000, default: 250 } }], responses: { "200": { description: "Timestamped raw and normalized values with units and simulation flag" }, ...standardErrors } } },
    "/diagnostics/{id}": { get: { tags: ["Engrain Connect"], security: bearer, summary: "Read one authorized diagnostic including DTCs and measurements", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Diagnostic detail" }, ...standardErrors } } },
    "/diagnostics/{id}/measurements": { get: { tags: ["Engrain Connect"], security: bearer, summary: "Read all captured measurements for one diagnostic", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Measurements with raw values, units and timestamps" }, ...standardErrors } } },
    "/assistant/vehicles/{id}/dtc-interpretation": { get: { tags: ["Engrain AI"], security: bearer, summary: "Interpret authorized DTCs with supporting record IDs", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }, { name: "scanId", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Structured interpretation, limitations and supportingRecords" }, ...standardErrors } } },
    "/assistant/vehicles/{id}/diagnostic-explanation": { get: { tags: ["Engrain AI"], security: bearer, summary: "Explain authorized diagnostics in plain language", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Structured explanation" }, ...standardErrors } } },
    "/assistant/vehicles/{id}/maintenance-analysis": { get: { tags: ["Engrain AI"], security: bearer, summary: "Analyze authorized maintenance history", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Structured maintenance analysis" }, ...standardErrors } } },
    "/assistant/vehicles/{id}/recommendations": { get: { tags: ["Engrain AI"], security: bearer, summary: "Suggest review of available service intervals", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Non-binding recommendations" }, ...standardErrors } } },
    "/assistant/vehicles/{id}/inconsistencies": { get: { tags: ["Engrain AI"], security: bearer, summary: "Surface neutral review signals in authorized history", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Neutral review signals; no fraud classification" }, ...standardErrors } } },
    "/assistant/vehicles/{id}/questions": { post: { tags: ["Engrain AI"], security: bearer, summary: "Answer a question about authorized vehicle history", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/HistoryQuestionInput" } } } }, responses: { "200": { description: "Structured answer with supporting record IDs" }, ...standardErrors } } },
    "/maintenance-records/{id}/finalize": { post: { tags: ["Trust"], security: bearer, summary: "Finalize and hash a maintenance record", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Finalized immutable record" }, "409": { description: "Already finalized" }, ...standardErrors } } },
    "/maintenance-records/{id}/corrections": { post: { tags: ["Trust"], security: bearer, summary: "Create a correction version without modifying a finalized record", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "201": { description: "Correction version created" }, "409": { description: "Original must be finalized" }, ...standardErrors } } },
    "/passports": { post: { tags: ["Passports"], security: bearer, summary: "Create a random, expiring shareable passport", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/PassportInput" } } } }, responses: { "201": { description: "Passport with publicUrl and 256-bit public token" }, ...standardErrors } } },
    "/passports/{id}": { get: { tags: ["Passports"], security: bearer, summary: "Read a private passport with MANAGE access", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Private passport" }, ...standardErrors } } },
    "/passports/{id}/qr": { get: { tags: ["Passports"], security: bearer, summary: "Generate an in-memory PNG QR code for an active passport link", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "publicUrl and qrCodeDataUrl" }, "409": { description: "Passport is revoked or expired" }, ...standardErrors } } },
    "/passports/{id}/revoke": { post: { tags: ["Passports"], security: bearer, summary: "Revoke a passport link immediately", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Revoked passport" }, ...standardErrors } } },
    "/passports/public/{publicToken}": { get: { tags: ["Passports"], summary: "Public privacy-filtered vehicle passport; no login required", parameters: [{ name: "publicToken", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Technical history, evidence metadata, coverage, gaps and alerts without personal data" }, "404": { description: "Unavailable, revoked or expired" }, "429": { description: "Public-link rate limit exceeded" } } } }
    , "/vehicles/{id}/transfers": { post: { tags: ["Transfers"], security: bearer, summary: "Initiate a platform-only digital ownership transfer", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "201": { description: "Pending transfer and legal limitation notice" }, ...standardErrors } } }
    , "/transfers/{id}/accept": { post: { tags: ["Transfers"], security: bearer, summary: "Accept a pending transfer as the invited account", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Ownership updated; active grants and passport links revoked" }, "409": { description: "Transfer expired or no longer pending" }, ...standardErrors } } }
  }
};
