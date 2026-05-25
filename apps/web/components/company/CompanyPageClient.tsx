"use client";

import type { Company } from "@repo/db";
import { useMemo, useState } from "react";
import { ToastContainer, Zoom } from "react-toastify";

import AddCompanyForm from "./AddCompanyForm";
import CompanyList from "./CompanyList";

// type Mode = "create" | "edit" | "delete" | null;

export default function CompanyPageClient({
  initialCompanies,
}: {
  initialCompanies: Company[];
}) {
  const [selected, setSelected] = useState<Company | null>(null);
  // const [mode, setMode] = useState<Mode>(null);
  const hasSelection = useMemo(() => selected !== null, [selected]);
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="flex justify-center">
      <div className="min-w-1/2 w-2/3 max-w-11/12">
        <h1 className="text-2xl my-10 ml-10">Registro de empresas</h1>
        <div className="flex mr-20 justify-end gap-2.5">
          <button
            className="border rounded-lg border-gray-200 py-2 px-2 bg-gray-50 disabled:text-gray-300"
            onClick={() => setFormOpen(true)}
          >
            Crear
          </button>
          <button
            className="border rounded-lg border-gray-200 py-2 px-2 bg-gray-50 disabled:text-gray-300"
            // onClick={() => setMode("edit")}
            disabled={!hasSelection}
            onClick={() => setFormOpen(true)}
          >
            Modificar
          </button>
          <button
            className="border rounded-lg border-gray-200 py-2 px-2 bg-gray-50 disabled:text-gray-300"
            // onClick={() => setMode("delete")}
            disabled={!hasSelection}
          >
            Eliminar
          </button>
        </div>
        <CompanyList
          companies={initialCompanies}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
        />
        <AddCompanyForm
          open={formOpen}
          onOpenChange={setFormOpen}
          company={selected ? selected : null}
        />
        {/* later: <CompanyFormDialog mode={mode} company={selected} onClose={() => setMode(null)} /> */}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000} //duracion para cerrarse solo (en ms)
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover
        theme="light"
        transition={Zoom}
      />
    </div>
  );
}
