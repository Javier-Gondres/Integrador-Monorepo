import { Suspense } from "react";

import { ForbiddenScreen } from "@/modules/auth/screens/forbidden-screen";

export default function ForbiddenPage() {
  return (
    <Suspense fallback={null}>
      <ForbiddenScreen />
    </Suspense>
  );
}
