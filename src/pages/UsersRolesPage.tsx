import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import PageTitle from "../components/ui/PageTitle";
import SearchableSelect from "../components/ui/SearchableSelect";
import { adminApi } from "../lib/api";
import type {
  AppUser,
  ModuleWithPermissions,
  Role,
  RolePermissionsByModule,
} from "../types/api";

export default function UsersRolesPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<ModuleWithPermissions[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionsByModule[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("2");
  const [error, setError] = useState("");
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "Admin@123",
    roleId: 2,
  });
  const [roleName, setRoleName] = useState("");

  async function loadAdminData(roleId = selectedRoleId) {
    setError("");
    try {
      const [usersResponse, rolesResponse, modulesResponse, permissionsResponse] =
        await Promise.all([
          adminApi.listUsers(),
          adminApi.listRoles(),
          adminApi.listModulesAndPermissions(),
          adminApi.getRolePermissions(Number(roleId)),
        ]);

      setUsers(usersResponse.data);
      setRoles(rolesResponse.data);
      setModules(modulesResponse.data);
      setRolePermissions(permissionsResponse.data);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load users and roles");
    }
  }

  useEffect(() => {
    void loadAdminData();
  }, [selectedRoleId]);

  return (
    <div className="space-y-5">
      <PageTitle
        title="Users & Roles"
        subtitle="Integrated with create/list/delete users, create/list roles, modules-permissions, and update role permissions."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setCreateRoleOpen(true)}>
              Create Role
            </Button>
            <Button onClick={() => setCreateUserOpen(true)}>Create User</Button>
          </div>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card title="Users" className="xl:col-span-7">
          {users.length === 0 ? (
            <EmptyState title="No users" description="No users were returned by the API." />
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.03] px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <p className="font-medium text-[#013144]">{user.name}</p>
                    <p className="mt-1 text-sm text-[#013144]/55">
                      {user.email} • {user.role?.name || "No role"}
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    className="h-9 px-3"
                    onClick={async () => {
                      if (!window.confirm(`Delete user ${user.name}?`)) {
                        return;
                      }
                      await adminApi.deleteUser(user.id);
                      await loadAdminData();
                    }}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Roles" className="xl:col-span-5">
          <div className="space-y-4">
            <SearchableSelect
              options={roles.map((role) => ({
                value: String(role.id),
                label: `${role.name} (#${role.id})`,
              }))}
              value={selectedRoleId}
              placeholder="Select role"
              onChange={(value) => setSelectedRoleId(value || "2")}
            />

            <div className="space-y-2">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="rounded-xl border border-[#013144]/12 bg-[#013144]/[0.03] px-4 py-3 text-sm text-[#013144]/70"
                >
                  {role.name}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card title="Modules & Permissions Catalog" className="xl:col-span-5">
          <div className="space-y-3">
            {modules.map((module) => (
              <div
                key={module.id}
                className="rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.03] px-4 py-4"
              >
                <p className="font-medium text-[#013144]">{module.name}</p>
                <p className="mt-1 text-xs text-[#013144]/50">{module.key}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {module.permissions.map((permission) => (
                    <span
                      key={permission.id}
                      className="rounded-full bg-[#013144]/[0.04] px-3 py-1 text-xs text-[#013144]"
                    >
                      {permission.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Role Permission Editor" className="xl:col-span-7">
          <div className="space-y-4">
            {rolePermissions.map((module) => (
              <div
                key={module.id}
                className="rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.03] px-4 py-4"
              >
                <p className="font-medium text-[#013144]">{module.name}</p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {module.permissions.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 text-sm text-[#013144]"
                    >
                      <input
                        type="checkbox"
                        checked={permission.assigned}
                        onChange={() =>
                          setRolePermissions((current) =>
                            current.map((item) =>
                              item.id !== module.id
                                ? item
                                : {
                                    ...item,
                                    permissions: item.permissions.map((candidate) =>
                                      candidate.id === permission.id
                                        ? { ...candidate, assigned: !candidate.assigned }
                                        : candidate
                                    ),
                                  }
                            )
                          )
                        }
                      />
                      {permission.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <Button
                onClick={async () => {
                  await adminApi.updateRolePermissions(Number(selectedRoleId), {
                    items: rolePermissions.map((module) => ({
                      moduleId: module.id,
                      permissionIds: module.permissions
                        .filter((permission) => permission.assigned)
                        .map((permission) => permission.id),
                    })),
                  });
                  await loadAdminData();
                }}
              >
                Save Permissions
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        open={createUserOpen}
        title="Create User"
        description="Uses `/api/v1/users`."
        onClose={() => setCreateUserOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateUserOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await adminApi.createUser(userForm);
                setCreateUserOpen(false);
                setUserForm({ name: "", email: "", password: "Admin@123", roleId: 2 });
                await loadAdminData();
              }}
            >
              Create User
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-3">
          <input
            value={userForm.name}
            onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Name"
            className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
          />
          <input
            value={userForm.email}
            onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="Email"
            className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
          />
          <input
            value={userForm.password}
            onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Password"
            className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
          />
          <SearchableSelect
            options={roles.map((role) => ({
              value: String(role.id),
              label: role.name,
            }))}
            value={String(userForm.roleId)}
            isClearable={false}
            onChange={(value) =>
              setUserForm((current) => ({ ...current, roleId: Number(value || "2") }))
            }
          />
        </div>
      </Modal>

      <Modal
        open={createRoleOpen}
        title="Create Role"
        description="Uses `/api/v1/roles`."
        onClose={() => setCreateRoleOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateRoleOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await adminApi.createRole({ name: roleName });
                setCreateRoleOpen(false);
                setRoleName("");
                await loadAdminData();
              }}
            >
              Create Role
            </Button>
          </div>
        }
      >
        <input
          value={roleName}
          onChange={(event) => setRoleName(event.target.value)}
          placeholder="Role name"
          className="h-11 w-full rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
        />
      </Modal>
    </div>
  );
}
