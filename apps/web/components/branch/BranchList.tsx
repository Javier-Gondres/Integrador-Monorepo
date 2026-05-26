import { Branch } from "@repo/db";
import { Dispatch, SetStateAction } from "react";

type BranchListProps = {
  branches: Branch[];
  selectedId: string | null;
  onSelect: Dispatch<SetStateAction<Branch | null>>;
};

export default function BranchList({
  branches,
  selectedId,
  onSelect,
}: BranchListProps) {
  return (
    <>
      <div className="max-w-full px-4 sm:px-6 lg:px-8 mt-5">
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {/* rounded border div below */}
              <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
                {branches.length === 0 ? (
                  <p className="font-bold p-2 text-2xl text-center">
                    No hay registros
                  </p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
                        >
                          ID
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900 "
                        >
                          Nombre
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900 "
                        >
                          Direccion
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900 "
                        >
                          Telefono
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900 "
                        >
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {branches.map((branch) => (
                        <tr
                          key={branch.id}
                          onClick={() => onSelect(branch)}
                          className={`${branch.id === selectedId ? "bg-gray-200" : ""} border border-slate-200`}
                        >
                          <td className="whitespace-nowrap py-4 px-3 text-sm font-medium text-gray-900">
                            {branch.id}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {branch.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {branch.address ?? "-"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {branch.phone ?? "-"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {branch.isActive ? "Activo" : "Inactivo"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
