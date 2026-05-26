"use client";

import type { Branch, Company } from "@repo/db";
import { useMemo, useState } from "react";
import { ToastContainer, Zoom } from "react-toastify";

import BranchList from "./BranchList";

type BranchPageClientProps = {
  initialBranches: Branch[];
  parentCompany: Company;
};

export default function BranchPageClient({
  initialBranches,
  parentCompany,
}: BranchPageClientProps) {
  const [selected, setSelected] = useState<Branch | null>(null);
  // const [mode, setMode] = useState<Mode>(null);
  const hasSelection = useMemo(() => selected !== null, [selected]);
  // const [formOpen, setFormOpen] = useState(false);
  // const [delDialog, setDelDialog] = useState(false);

  /*   const createCompanyHandler = () => {
    setSelected(null);
    setFormOpen(true);
  }; */

  return (
    <div className="flex justify-center">
      <div className="min-w-1/2 w-2/3 max-w-11/12">
        <h1 className="text-2xl my-10 ml-10">
          Registro de sucursales: {parentCompany.name}
        </h1>
        <div className="flex mr-20 justify-end gap-2.5">
          <button
            className="border rounded-lg border-gray-200 py-2 px-2 bg-gray-50 disabled:text-gray-300"
            // onClick={() => createCompanyHandler()}
          >
            Crear
          </button>
          <button
            className="border rounded-lg border-gray-200 py-2 px-2 bg-gray-50 disabled:text-gray-300"
            disabled={!hasSelection}
            // onClick={() => setFormOpen(true)}
          >
            Modificar
          </button>
          <button
            className="border rounded-lg border-gray-200 py-2 px-2 bg-gray-50 disabled:text-gray-300"
            // onClick={() => setDelDialog(true)}
            disabled={!hasSelection}
          >
            Eliminar
          </button>
        </div>
        <BranchList
          branches={initialBranches}
          selectedId={selected?.id ? selected.id : null}
          onSelect={setSelected}
        />
        {/*         <AddCompanyForm
          open={formOpen}
          onOpenChange={setFormOpen}
          company={selected}
          stateSelection={setSelected}
        />
        {selected && (
          <DeleteCompanyDialog
            open={delDialog}
            onOpenChange={setDelDialog}
            company={selected!}
          />
        )} */}

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
