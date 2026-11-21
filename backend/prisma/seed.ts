import { hash } from "bcryptjs";
import { createHash } from "node:crypto";
import { randomBytes } from "node:crypto";

import { PrismaClient } from "@prisma/client";

import { vehicleInformationProviders } from "../src/modules/external-data/providers/registry";

const prisma = new PrismaClient();
const demoPassword = "EngrainDemo!2026";
const sha256 = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

const ensureCurrentUserOwnership = async (vehicleId: string, userId: string) => {
  const current = await prisma.vehicleOwnership.findFirst({ where: { vehicleId, userId, isCurrent: true } });
  if (!current) {
    await prisma.vehicleOwnership.create({ data: { vehicleId, userId, ownerKind: "USER" } });
  }
};

async function main() {
  const passwordHash = await hash(demoPassword, 12);
  await Promise.all(vehicleInformationProviders().map(({ definition }) => prisma.externalDataProvider.upsert({
    where: { code: definition.code },
    update: {
      name: definition.name, status: definition.status, supportsPlateLookup: definition.supportsPlateLookup,
      allowsAutomation: definition.allowsAutomation, requiresCredentials: definition.requiresCredentials,
      requiresAgreement: definition.requiresAgreement, documentationUrl: definition.documentationUrl,
      manualPortalUrl: definition.manualPortalUrl, dataClassification: definition.dataClassification,
      termsSummary: definition.termsSummary
    },
    create: {
      code: definition.code, name: definition.name, status: definition.status, supportsPlateLookup: definition.supportsPlateLookup,
      allowsAutomation: definition.allowsAutomation, requiresCredentials: definition.requiresCredentials,
      requiresAgreement: definition.requiresAgreement, documentationUrl: definition.documentationUrl,
      manualPortalUrl: definition.manualPortalUrl, dataClassification: definition.dataClassification,
      termsSummary: definition.termsSummary
    }
  })));
  const [superAdmin, owner, workshopAdmin, mechanic, dealershipAdmin, salesAgent] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@engrain.test" },
      update: { name: "Avery Admin", role: "SUPER_ADMIN", isActive: true, passwordHash },
      create: { name: "Avery Admin", email: "admin@engrain.test", role: "SUPER_ADMIN", passwordHash }
    }),
    prisma.user.upsert({
      where: { email: "owner@engrain.test" },
      update: { name: "Olivia Owner", role: "VEHICLE_OWNER", isActive: true, passwordHash },
      create: { name: "Olivia Owner", email: "owner@engrain.test", role: "VEHICLE_OWNER", passwordHash }
    }),
    prisma.user.upsert({
      where: { email: "workshop.admin@engrain.test" },
      update: { name: "Walter Workshop", role: "WORKSHOP_ADMIN", isActive: true, passwordHash },
      create: { name: "Walter Workshop", email: "workshop.admin@engrain.test", role: "WORKSHOP_ADMIN", passwordHash }
    }),
    prisma.user.upsert({
      where: { email: "mechanic@engrain.test" },
      update: { name: "Maya Mechanic", role: "MECHANIC", isActive: true, passwordHash },
      create: { name: "Maya Mechanic", email: "mechanic@engrain.test", role: "MECHANIC", passwordHash }
    }),
    prisma.user.upsert({
      where: { email: "dealer.admin@engrain.test" },
      update: { name: "Diego Dealer", role: "DEALERSHIP_ADMIN", isActive: true, passwordHash },
      create: { name: "Diego Dealer", email: "dealer.admin@engrain.test", role: "DEALERSHIP_ADMIN", passwordHash }
    }),
    prisma.user.upsert({
      where: { email: "sales@engrain.test" },
      update: { name: "Sofia Sales", role: "SALES_AGENT", isActive: true, passwordHash },
      create: { name: "Sofia Sales", email: "sales@engrain.test", role: "SALES_AGENT", passwordHash }
    })
  ]);

  const workshopOrganization = await prisma.organization.upsert({
    where: { taxId: "DEMO-WS-001" },
    update: { name: "Torque Trust Workshop", type: "WORKSHOP", isActive: true },
    create: { name: "Torque Trust Workshop", type: "WORKSHOP", taxId: "DEMO-WS-001", email: "hello@torquetrust.test" }
  });
  const dealershipOrganization = await prisma.organization.upsert({
    where: { taxId: "DEMO-DEALER-001" },
    update: { name: "DriveTrust Motors", type: "DEALERSHIP", isActive: true },
    create: { name: "DriveTrust Motors", type: "DEALERSHIP", taxId: "DEMO-DEALER-001", email: "sales@drivetrust.test" }
  });

  await Promise.all([
    prisma.organizationMember.upsert({ where: { organizationId_userId: { organizationId: workshopOrganization.id, userId: workshopAdmin.id } }, update: { role: "WORKSHOP_ADMIN", status: "ACTIVE" }, create: { organizationId: workshopOrganization.id, userId: workshopAdmin.id, role: "WORKSHOP_ADMIN" } }),
    prisma.organizationMember.upsert({ where: { organizationId_userId: { organizationId: workshopOrganization.id, userId: mechanic.id } }, update: { role: "MECHANIC", status: "ACTIVE" }, create: { organizationId: workshopOrganization.id, userId: mechanic.id, role: "MECHANIC" } }),
    prisma.organizationMember.upsert({ where: { organizationId_userId: { organizationId: dealershipOrganization.id, userId: dealershipAdmin.id } }, update: { role: "DEALERSHIP_ADMIN", status: "ACTIVE" }, create: { organizationId: dealershipOrganization.id, userId: dealershipAdmin.id, role: "DEALERSHIP_ADMIN" } }),
    prisma.organizationMember.upsert({ where: { organizationId_userId: { organizationId: dealershipOrganization.id, userId: salesAgent.id } }, update: { role: "SALES_AGENT", status: "ACTIVE" }, create: { organizationId: dealershipOrganization.id, userId: salesAgent.id, role: "SALES_AGENT" } })
  ]);

  const workshop = await prisma.workshop.upsert({
    where: { organizationId: workshopOrganization.id },
    update: { name: "Torque Trust Workshop", isActive: true },
    create: { organizationId: workshopOrganization.id, name: "Torque Trust Workshop", phone: "+506-5555-0100", address: "San José, Costa Rica" }
  });

  const vehicle = await prisma.vehicle.upsert({
    where: { vin: "1HGCM82633A004352" },
    update: { plate: "DEMO-001", make: "Honda", model: "Accord", year: 2020, mileageKm: 72_450, status: "ACTIVE", dataSource: "MANUAL" },
    create: { vin: "1HGCM82633A004352", plate: "DEMO-001", make: "Honda", model: "Accord", year: 2020, mileageKm: 72_450, dataSource: "MANUAL" }
  });
  await ensureCurrentUserOwnership(vehicle.id, owner.id);

  await prisma.vehicleAccessGrant.upsert({
    where: { vehicleId_targetKey: { vehicleId: vehicle.id, targetKey: `workshop:${workshop.id}` } },
    update: { permission: "SERVICE", status: "ACTIVE", expiresAt: null, revokedAt: null, grantedById: owner.id },
    create: { vehicleId: vehicle.id, targetKey: `workshop:${workshop.id}`, workshopId: workshop.id, grantedById: owner.id, permission: "SERVICE" }
  });

  const device = await prisma.device.upsert({
    where: { serialNumber: "ENGRAIN-OBD2-DEMO-001" },
    update: { vehicleId: vehicle.id, organizationId: workshopOrganization.id, registeredByUserId: workshopAdmin.id, status: "ACTIVE" },
    create: { serialNumber: "ENGRAIN-OBD2-DEMO-001", type: "OBD2_GENERIC", vehicleId: vehicle.id, organizationId: workshopOrganization.id, registeredByUserId: workshopAdmin.id }
  });
  const seededScanContent = { vehicleId: vehicle.id, providerKey: "simulated-obd", scenario: "misfire", mileageKm: 72_400, dtcs: ["P0300"] };
  const scan = (await prisma.diagnosticScan.findFirst({ where: { deviceId: device.id, vehicleId: vehicle.id } })) ?? await prisma.diagnosticScan.create({
    data: {
      vehicleId: vehicle.id, deviceId: device.id, organizationId: workshopOrganization.id, performedByUserId: mechanic.id,
      source: "OBD2", recordSource: "SIMULATED", providerKey: "simulated-obd", providerMetadata: { scenario: "misfire", purpose: "hackathon-demo" },
      isSimulated: true, physicalConnectionVerified: false, integrityStatus: "FINALIZED", contentHash: sha256(seededScanContent), finalizedHash: sha256({ seededScanContent, version: 1 }), finalizedAt: new Date(),
      status: "SUCCESS", mileageKm: 72_400, rawPayload: { protocol: "SIMULATED-OBD2", simulated: true, scenario: "misfire" }
    }
  });
  await prisma.diagnosticScan.update({
    where: { id: scan.id },
    data: {
      providerKey: "simulated-obd", providerMetadata: { scenario: "misfire", purpose: "hackathon-demo" }, isSimulated: true, physicalConnectionVerified: false,
      recordSource: "SIMULATED", integrityStatus: "FINALIZED", contentHash: sha256(seededScanContent), finalizedHash: sha256({ seededScanContent, version: 1 }), finalizedAt: new Date(),
      rawPayload: { protocol: "SIMULATED-OBD2", simulated: true, scenario: "misfire" }
    }
  });
  await prisma.diagnosticTroubleCode.upsert({
    where: { scanId_code: { scanId: scan.id, code: "P0300" } },
    update: { status: "ACTIVE", severity: "WARNING", description: "Random/multiple cylinder misfire detected." },
    create: { scanId: scan.id, code: "P0300", status: "ACTIVE", severity: "WARNING", description: "Random/multiple cylinder misfire detected." }
  });
  const demoMeasurements = [
    { metric: "engine_rpm", label: "RPM del motor", rawValue: "920", normalizedValue: 920, unit: "rpm" },
    { metric: "coolant_temperature", label: "Temperatura del refrigerante", rawValue: "89", normalizedValue: 89, unit: "°C" },
    { metric: "vehicle_speed", label: "Velocidad del vehículo", rawValue: "0", normalizedValue: 0, unit: "km/h" },
    { metric: "fuel_level", label: "Nivel de combustible", rawValue: "62.4", normalizedValue: 62.4, unit: "%" },
    { metric: "control_module_voltage", label: "Voltaje del módulo", rawValue: "13.9", normalizedValue: 13.9, unit: "V" },
    { metric: "catalyst_monitor", label: "Monitor de catalizador", rawValue: "COMPLETE", normalizedValue: undefined, unit: undefined }
  ];
  for (const item of demoMeasurements) {
    const exists = await prisma.diagnosticMeasurement.findFirst({ where: { scanId: scan.id, metric: item.metric } });
    if (!exists) await prisma.diagnosticMeasurement.create({ data: { scanId: scan.id, ...item, recordSource: "SIMULATED" } });
  }

  const workOrder = await prisma.workOrder.upsert({
    where: { reference: "WO-DEMO-0001" },
    update: { vehicleId: vehicle.id, workshopId: workshop.id, organizationId: workshopOrganization.id, createdByUserId: workshopAdmin.id, assignedMechanicId: mechanic.id, status: "COMPLETED" },
    create: { reference: "WO-DEMO-0001", vehicleId: vehicle.id, workshopId: workshop.id, organizationId: workshopOrganization.id, createdByUserId: workshopAdmin.id, assignedMechanicId: mechanic.id, status: "COMPLETED", title: "Diagnóstico y cambio de bujías", description: "Servicio ficticio para la demostración.", closedAt: new Date() }
  });
  const maintenance = (await prisma.maintenanceRecord.findFirst({ where: { workOrderId: workOrder.id } })) ?? await prisma.maintenanceRecord.create({
    data: { vehicleId: vehicle.id, workOrderId: workOrder.id, workshopId: workshop.id, organizationId: workshopOrganization.id, createdByUserId: mechanic.id, status: "COMPLETED", recordSource: "SIMULATED", title: "Cambio de bujías", description: "Mantenimiento ficticio asociado al vehículo.", performedAt: new Date(), mileageKm: 72_450 }
  });
  if (!(await prisma.serviceProcedure.findFirst({ where: { maintenanceRecordId: maintenance.id, name: "Reemplazo de bujías" } }))) {
    await prisma.serviceProcedure.create({ data: { maintenanceRecordId: maintenance.id, name: "Reemplazo de bujías", laborMinutes: 45, completedAt: new Date() } });
  }
  if (!(await prisma.servicePart.findFirst({ where: { maintenanceRecordId: maintenance.id, partNumber: "NGK-DEMO-4" } }))) {
    await prisma.servicePart.create({ data: { maintenanceRecordId: maintenance.id, partNumber: "NGK-DEMO-4", name: "Juego de bujías", quantity: 1, unitCostCents: 4500 } });
  }
  await prisma.serviceEvidence.upsert({
    where: { storageKey: "demo/vehicles/1HGCM82633A004352/maintenance-invoice.pdf" },
    update: { maintenanceRecordId: maintenance.id, uploadedByUserId: mechanic.id },
    create: { maintenanceRecordId: maintenance.id, uploadedByUserId: mechanic.id, type: "INVOICE", storageKey: "demo/vehicles/1HGCM82633A004352/maintenance-invoice.pdf", fileName: "factura-demo.pdf", mimeType: "application/pdf", sizeBytes: 12_000, sha256: "f5a5fd42d16a20302798ef6ed309979b43003d2320d5c688cc1a352f5b3b3c71" }
  });
  if (!(await prisma.maintenanceSchedule.findFirst({ where: { vehicleId: vehicle.id, title: "Cambio de aceite" } }))) {
    await prisma.maintenanceSchedule.create({ data: { vehicleId: vehicle.id, createdByUserId: owner.id, title: "Cambio de aceite", intervalKm: 8_000, nextDueMileageKm: 80_450, status: "ACTIVE" } });
  }
  if (!(await prisma.vehicleMileageLog.findFirst({ where: { vehicleId: vehicle.id, mileageKm: 72_450, recordSource: "SIMULATED" } }))) {
    await prisma.vehicleMileageLog.create({ data: { vehicleId: vehicle.id, recordedByUserId: mechanic.id, organizationId: workshopOrganization.id, mileageKm: 72_450, recordSource: "SIMULATED" } });
  }
  const passport = (await prisma.vehiclePassport.findFirst({ where: { vehicleId: vehicle.id, createdByUserId: owner.id, status: "ACTIVE" } })) ?? await prisma.vehiclePassport.create({
    data: {
      vehicleId: vehicle.id,
      createdByUserId: owner.id,
      publicToken: randomBytes(32).toString("base64url"),
      visibility: "SHAREABLE",
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1_000),
      snapshot: { title: "Pasaporte demo", maintenanceCount: 1, diagnosticCount: 1 }
    }
  });
  if (!(await prisma.notification.findFirst({ where: { userId: owner.id, vehicleId: vehicle.id, type: "DIAGNOSTIC_READY" } }))) {
    await prisma.notification.create({ data: { userId: owner.id, vehicleId: vehicle.id, type: "DIAGNOSTIC_READY", title: "Diagnóstico disponible", body: `El pasaporte ${passport.publicToken} está listo para demostración.` } });
  }
  await prisma.auditLog.create({ data: { actorUserId: superAdmin.id, vehicleId: vehicle.id, action: "CREATE", entityType: "Seed", entityId: vehicle.id, metadata: { fictional: true } } });

  console.info("ENGRAIN seed completed. Demo password for all fictional users: EngrainDemo!2026");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
