-- Optional traceability link: Sale may originate from a Reservation (audit only; not required).

ALTER TABLE "Sale" ADD COLUMN "reservationId" TEXT;

CREATE INDEX "Sale_reservationId_idx" ON "Sale"("reservationId");

ALTER TABLE "Sale" ADD CONSTRAINT "Sale_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
