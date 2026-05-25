import { Company } from "@repo/db";
import { Dispatch, SetStateAction } from "react";

type CompanyListProps = {
  companies: Company[];
  selectedId: string | null;
  onSelect: Dispatch<SetStateAction<Company | null>>;
};

export default function CompanyList({
  companies,
  selectedId,
  onSelect,
}: CompanyListProps) {
  return (
    <>
      <div className="max-w-full px-4 sm:px-6 lg:px-8 mt-5">
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {/* rounded border div below */}
              <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
                      >
                        id
                      </th>
                      <th
                        scope="col"
                        className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900 "
                      >
                        nombre
                      </th>
                      <th
                        scope="col"
                        className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900 "
                      >
                        rnc
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.length === 0 ? (
                      <p>No hay empresas registradas</p>
                    ) : (
                      companies.map((company) => (
                        <tr
                          key={company.id}
                          onClick={() => onSelect(company)}
                          className={`${company.id === selectedId ? "bg-gray-200" : ""} border border-slate-200`}
                        >
                          <td className="whitespace-nowrap py-4 px-3 text-sm font-medium text-gray-900">
                            {company.id}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {company.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {company.rnc}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
