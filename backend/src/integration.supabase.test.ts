import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { app } from "./app";
import { prisma } from "./lib/prisma";
import { resetAuthRateLimitForTests } from "./middlewares/auth-rate-limit";
import { resetExternalQueryRateLimitForTests } from "./modules/external-data/external-query-rate-limit";

const describeSupabase = process.env.RUN_INTEGRATION_TESTS === "true" ? describe : describe.skip;
const demoPassword = "EngrainDemo!2026";

const login = async (email: string) => {
  const response = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password: demoPassword })
    .expect(200);
  return response.body.data as { accessToken: string };
};

beforeEach(() => {
  resetAuthRateLimitForTests();
  resetExternalQueryRateLimitForTests();
});

describeSupabase("Supabase trust integration", () => {
  it("authenticates demo accounts and enforces workshop grant isolation", async () => {
    const [owner, mechanic, salesAgent] = await Promise.all([
      login("owner@engrain.test"),
      login("mechanic@engrain.test"),
      login("sales@engrain.test")
    ]);

    const ownerVehicles = await request(app)
      .get("/api/v1/vehicles")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .expect(200);
    const vehicle = ownerVehicles.body.data.vehicles.find((item: { vin: string }) => item.vin === "1HGCM82633A004352");
    expect(vehicle).toBeDefined();

    const workshopVehicles = await request(app)
      .get("/api/v1/vehicles")
      .set("Authorization", `Bearer ${mechanic.accessToken}`)
      .expect(200);
    expect(workshopVehicles.body.data.vehicles.some((item: { id: string }) => item.id === vehicle.id)).toBe(true);

    await request(app)
      .get(`/api/v1/vehicles/${vehicle.id}`)
      .set("Authorization", `Bearer ${salesAgent.accessToken}`)
      .expect(404);
  }, 30_000);

  it("stores explicitly simulated OBD2 diagnostics and keeps them inside vehicle authorization", async () => {
    const [superAdmin, owner, salesAgent] = await Promise.all([
      login("admin@engrain.test"),
      login("owner@engrain.test"),
      login("sales@engrain.test")
    ]);
    const ownerVehicles = await request(app).get("/api/v1/vehicles").set("Authorization", `Bearer ${owner.accessToken}`).expect(200);
    const vehicle = ownerVehicles.body.data.vehicles.find((item: { vin: string }) => item.vin === "1HGCM82633A004352");

    await request(app)
      .post(`/api/v1/vehicles/${vehicle.id}/diagnostics/simulations`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ scenario: "misfire" })
      .expect(403);

    const simulated = await request(app)
      .post(`/api/v1/vehicles/${vehicle.id}/diagnostics/simulations`)
      .set("Authorization", `Bearer ${superAdmin.accessToken}`)
      .send({ scenario: "misfire" })
      .expect(201);
    const scan = simulated.body.data.diagnostic;
    expect(scan).toMatchObject({ isSimulated: true, physicalConnectionVerified: false, recordSource: "SIMULATED" });
    expect(scan.measurements.length).toBeGreaterThan(0);

    await request(app)
      .get(`/api/v1/diagnostics/${scan.id}`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .expect(200);
    const series = await request(app)
      .get(`/api/v1/vehicles/${vehicle.id}/diagnostics/measurements?metric=engine_rpm&limit=10`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .expect(200);
    expect(series.body.data.measurements).toEqual(expect.arrayContaining([
      expect.objectContaining({ metric: "engine_rpm", scan: expect.objectContaining({ isSimulated: true }) })
    ]));
    await request(app)
      .get(`/api/v1/diagnostics/${scan.id}`)
      .set("Authorization", `Bearer ${salesAgent.accessToken}`)
      .expect(404);

    const assistant = await request(app)
      .get(`/api/v1/assistant/vehicles/${vehicle.id}/dtc-interpretation?scanId=${scan.id}`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .expect(200);
    expect(assistant.body.data.supportingRecords).toEqual(expect.arrayContaining([
      expect.objectContaining({ entityType: "DiagnosticScan", id: scan.id, isSimulated: true })
    ]));
  }, 30_000);

  it("shares a privacy-filtered passport, creates a QR code, and enforces revocation and expiration", async () => {
    const owner = await login("owner@engrain.test");
    const ownerVehicles = await request(app).get("/api/v1/vehicles").set("Authorization", `Bearer ${owner.accessToken}`).expect(200);
    const vehicle = ownerVehicles.body.data.vehicles.find((item: { vin: string }) => item.vin === "1HGCM82633A004352");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1_000).toISOString();

    const created = await request(app)
      .post("/api/v1/passports")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ vehicleId: vehicle.id, expiresAt, snapshot: { ownerEmail: "must-not-be-public@example.test" } })
      .expect(201);
    const passport = created.body.data.passport;
    expect(passport.publicToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(passport.publicUrl).toContain(passport.publicToken);

    const qr = await request(app)
      .get(`/api/v1/passports/${passport.id}/qr`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .expect(200);
    expect(qr.body.data.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);

    const publicView = await request(app).get(`/api/v1/passports/public/${passport.publicToken}`).expect(200);
    expect(publicView.body.data.passport.vehicle.vinMasked).toContain("***");
    expect(publicView.body.data.passport.snapshot).toBeUndefined();
    expect(JSON.stringify(publicView.body)).not.toContain("must-not-be-public@example.test");
    expect(JSON.stringify(publicView.body)).not.toContain("storageKey");
    expect(JSON.stringify(publicView.body)).not.toContain("uploadedBy");

    await request(app)
      .post(`/api/v1/passports/${passport.id}/revoke`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .expect(200);
    await request(app).get(`/api/v1/passports/public/${passport.publicToken}`).expect(404);

    const expiring = await request(app)
      .post("/api/v1/passports")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ vehicleId: vehicle.id, expiresAt })
      .expect(201);
    await prisma.vehiclePassport.update({ where: { id: expiring.body.data.passport.id }, data: { expiresAt: new Date(Date.now() - 1_000) } });
    await request(app).get(`/api/v1/passports/public/${expiring.body.data.passport.publicToken}`).expect(404);
  }, 30_000);

  it("transfers a separate demo vehicle digitally without representing it as a legal transfer", async () => {
    const [owner, salesAgent] = await Promise.all([login("owner@engrain.test"), login("sales@engrain.test")]);
    const vin = `1HGCM82633A${String(Date.now()).slice(-6)}`;
    const vehicleResponse = await request(app)
      .post("/api/v1/vehicles")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ vin, make: "Honda", model: "Civic", year: 2020, mileageKm: 45_000, dataSource: "MANUAL" })
      .expect(201);
    const vehicle = vehicleResponse.body.data.vehicle;
    const passportResponse = await request(app)
      .post("/api/v1/passports")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ vehicleId: vehicle.id })
      .expect(201);

    const initiated = await request(app)
      .post(`/api/v1/vehicles/${vehicle.id}/transfers`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ recipientEmail: "sales@engrain.test" })
      .expect(201);
    expect(initiated.body.data.legalNotice.toLowerCase()).toContain("no sustituye");

    await request(app)
      .post(`/api/v1/transfers/${initiated.body.data.transfer.id}/accept`)
      .set("Authorization", `Bearer ${salesAgent.accessToken}`)
      .expect(200);
    await request(app).get(`/api/v1/vehicles/${vehicle.id}`).set("Authorization", `Bearer ${owner.accessToken}`).expect(404);
    await request(app).get(`/api/v1/vehicles/${vehicle.id}`).set("Authorization", `Bearer ${salesAgent.accessToken}`).expect(200);
    await request(app).get(`/api/v1/passports/public/${passportResponse.body.data.passport.publicToken}`).expect(404);
  }, 30_000);

  it("preserves external-data authorization, manual provenance and explicit simulation labeling", async () => {
    const [owner, superAdmin, salesAgent] = await Promise.all([
      login("owner@engrain.test"), login("admin@engrain.test"), login("sales@engrain.test")
    ]);
    const ownerVehicles = await request(app).get("/api/v1/vehicles").set("Authorization", `Bearer ${owner.accessToken}`).expect(200);
    const vehicle = ownerVehicles.body.data.vehicles.find((item: { vin: string }) => item.vin === "1HGCM82633A004352");

    const providers = await request(app).get("/api/v1/external-providers").set("Authorization", `Bearer ${owner.accessToken}`).expect(200);
    expect(providers.body.data.providers).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "HACIENDA", status: "MANUAL_ONLY", allowsAutomation: false }),
      expect.objectContaining({ code: "MOCK", status: "AVAILABLE" })
    ]));

    await request(app)
      .post(`/api/v1/vehicles/${vehicle.id}/external-queries`)
      .set("Authorization", `Bearer ${salesAgent.accessToken}`)
      .send({ providers: ["HACIENDA"] })
      .expect(404);

    const manual = await request(app)
      .post(`/api/v1/vehicles/${vehicle.id}/external-queries`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ providers: ["HACIENDA", "DEKRA"], mode: "MANUAL" })
      .expect(201);
    expect(manual.body.data.query).toMatchObject({ status: "MANUAL_REQUIRED", queryMethod: "MANUAL_PORTAL" });
    expect(manual.body.data.query.records.every((record: { isSimulated: boolean; method: string }) => !record.isSimulated && record.method === "MANUAL_PORTAL")).toBe(true);

    const document = await request(app)
      .post(`/api/v1/external-queries/${manual.body.data.query.id}/documents`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ institution: "DEKRA", type: "CERTIFICATE", fileName: "demo-dekra.pdf", mimeType: "application/pdf", sizeBytes: 1000, sha256: "f5a5fd42d16a20302798ef6ed309979b43003d2320d5c688cc1a352f5b3b3c71" })
      .expect(201);
    expect(document.body.data.record).toMatchObject({ method: "MANUAL_DOCUMENT", isSimulated: false });

    await request(app)
      .post(`/api/v1/vehicles/${vehicle.id}/external-queries`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ providers: ["MOCK"], mode: "SIMULATED" })
      .expect(403);

    const simulated = await request(app)
      .post("/api/v1/external-queries/plate")
      .set("Authorization", `Bearer ${superAdmin.accessToken}`)
      .send({ plate: { category: "AUTO", code: "DEMO", number: "123456" }, providers: ["MOCK"], mode: "SIMULATED" })
      .expect(201);
    expect(simulated.body.data.query.records.length).toBeGreaterThan(0);
    expect(simulated.body.data.query.records.every((record: { isSimulated: boolean; method: string }) => record.isSimulated && record.method === "MOCK")).toBe(true);

    await request(app)
      .get(`/api/v1/external-queries/${simulated.body.data.query.id}`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .expect(404);
  }, 60_000);
});

afterAll(async () => {
  await prisma.$disconnect();
});
