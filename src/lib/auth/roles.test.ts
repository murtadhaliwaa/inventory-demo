import { afterEach, describe, expect, it, vi } from "vitest"
import {
  canDeleteInventory,
  canManageInventory,
  canViewAuditLog,
  getWmsRole,
} from "./roles"

describe("getWmsRole", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("returns viewer when user is null", () => {
    expect(getWmsRole(null)).toBe("viewer")
  })

  it("reads wms_role from app_metadata", () => {
    expect(
      getWmsRole({ id: "1", email: "a@x.com", app_metadata: { wms_role: "operator" } })
    ).toBe("operator")
  })

  it("treats wms_admin as admin", () => {
    expect(getWmsRole({ id: "1", email: "a@x.com", app_metadata: { wms_admin: true } })).toBe(
      "admin"
    )
  })

  it("defaults to operator when no metadata", () => {
    expect(getWmsRole({ id: "1", email: "staff@x.com" })).toBe("operator")
  })

  it("promotes WMS_ADMIN_EMAILS to admin", () => {
    vi.stubEnv("WMS_ADMIN_EMAILS", "boss@company.com")
    expect(getWmsRole({ id: "1", email: "boss@company.com" })).toBe("admin")
  })
})

describe("permissions", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  const admin = { id: "1", email: "admin@x.com", app_metadata: { wms_role: "admin" } }
  const operator = { id: "2", email: "op@x.com", app_metadata: { wms_role: "operator" } }
  const viewer = { id: "3", email: "v@x.com", app_metadata: { wms_role: "viewer" } }

  it("manage: admin and operator only", () => {
    expect(canManageInventory(admin)).toBe(true)
    expect(canManageInventory(operator)).toBe(true)
    expect(canManageInventory(viewer)).toBe(false)
  })

  it("delete: admin only when allow-list empty", () => {
    vi.stubEnv("WMS_ADMIN_EMAILS", "")
    expect(canDeleteInventory(admin)).toBe(true)
    expect(canDeleteInventory(operator)).toBe(false)
  })

  it("delete: restricted to allow-list when set", () => {
    vi.stubEnv("WMS_ADMIN_EMAILS", "boss@company.com")
    expect(canDeleteInventory(admin)).toBe(false)
    expect(canDeleteInventory({ ...admin, email: "boss@company.com" })).toBe(true)
  })

  it("audit log: admin only", () => {
    expect(canViewAuditLog(admin)).toBe(true)
    expect(canViewAuditLog(operator)).toBe(false)
  })
})
