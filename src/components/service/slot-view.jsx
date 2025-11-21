function BoolBadge({ value }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${
        value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {value ? "Yes" : "No"}
    </span>
  );
}

function KeyValue({ k, v }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <div className="text-sm text-slate-600">{k}</div>
      <div className="text-sm font-medium text-slate-800">{v}</div>
    </div>
  );
}

export default function SlotConfigViewer({ slotConfig }) {
  const {
    consultationSlots = null,
    nursingSlots = null,
    equipmentBooking = null,
  } = slotConfig || {};

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Slot Configuration</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Consultation Card */}
        {consultationSlots && (
          <div className="border rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold">Consultation Slots</h3>
                <p className="text-xs text-slate-500">
                  Daytime appointment / teleconsult slots
                </p>
              </div>
              <div className="mt-1">
                <BoolBadge value={consultationSlots?.enabled} />
              </div>
            </div>

            <div className="mt-2">
              <KeyValue k="Start Time" v={consultationSlots?.startTime} />
              <KeyValue k="End Time" v={consultationSlots?.endTime} />
              <KeyValue
                k="Slot Duration"
                v={`${consultationSlots?.slotDuration} min`}
              />

              {/* Quick summary line */}
              <div className="mt-3 text-sm text-slate-600">
                <strong>Slots per day:</strong>{" "}
                {consultationSlots?.enabled
                  ? Math.max(
                      0,
                      Math.floor(
                        ((parseTime(consultationSlots?.endTime || 0) -
                          parseTime(consultationSlots?.startTime || 0)) *
                          60) /
                          consultationSlots?.slotDuration
                      )
                    )
                  : "—"}
              </div>
            </div>
          </div>
        )}

        {/* Nursing Card */}
        {nursingSlots && (
          <div className="border rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold">Nursing Slots</h3>
                <p className="text-xs text-slate-500">
                  Shift-based nursing / home care availability
                </p>
              </div>
              <div className="mt-1">
                <BoolBadge value={nursingSlots?.enabled} />
              </div>
            </div>

            <div className="mt-2">
              <KeyValue
                k="Shift Types"
                v={<ShiftList items={nursingSlots?.shiftTypes} />}
              />
              <KeyValue
                k="Min Duration"
                v={`${nursingSlots?.minDuration} min`}
              />
              <KeyValue
                k="Max Duration"
                v={`${nursingSlots?.maxDuration} min`}
              />
              <KeyValue
                k="Available 24x7"
                v={<BoolBadge value={nursingSlots?.available24x7} />}
              />
              <KeyValue
                k="Allow Custom Duration"
                v={<BoolBadge value={nursingSlots?.allowCustomDuration} />}
              />

              {/* Helpful hint */}
              <div className="mt-3 text-sm text-slate-600">
                {nursingSlots?.enabled && nursingSlots?.available24x7 ? (
                  <>
                    <strong>Note:</strong> Nursing service is available
                    round-the-clock. For fixed-duration shifts show the
                    configured min/max duration.
                  </>
                ) : (
                  <strong>Note:</strong>
                )}
              </div>
            </div>
          </div>
        )}
        {/* {equipmentBooking && (
          <div className="border rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold">
                  Equipment Booking Slots
                </h3>
                <p className="text-xs text-slate-500">
                  Shift-based nursing / home care availability
                </p>
              </div>
              <div className="mt-1">
                <BoolBadge value={equipmentBooking?.enabled} />
              </div>
            </div>

            <div className="mt-2">
              <KeyValue
                k="Min Duration"
                v={`${equipmentBooking?.minDuration||0} min`}
              />
              <KeyValue
                k="Max Duration"
                v={`${equipmentBooking.maxDuration} min`}
              />
              <KeyValue
                k="Available 24x7"
                v={<BoolBadge value={equipmentBooking?.available24x7} />}
              />
            </div>
          </div>
        )} */}

        {/* Equipment Booking Card */}
        {equipmentBooking && (
          <div className="border rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold">Equipment Booking</h3>
                <p className="text-xs text-slate-500">
                  Medical equipment rental / duration availability
                </p>
              </div>
              <div className="mt-1">
                <BoolBadge value={equipmentBooking?.enabled} />
              </div>
            </div>

            <div className="mt-2">
              <KeyValue
                k="Min Duration"
                v={`${equipmentBooking.minDuration} min`}
              />
              <KeyValue
                k="Max Duration"
                v={`${equipmentBooking.maxDuration} min`}
              />
              <KeyValue
                k="Available 24x7"
                v={<BoolBadge value={equipmentBooking.available24x7} />}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ShiftList({ items }) {
  if (!items || items.length === 0)
    return <span className="text-slate-500">—</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s) => (
        <span
          key={s}
          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-slate-100 text-slate-800"
        >
          {s}
        </span>
      ))}
    </div>
  );
}

function parseTime(t) {
  // t = "HH:MM" -> returns hours as float
  const [hh, mm] = (t || "00:00").split(":").map(Number);
  if (isNaN(hh) || isNaN(mm)) return 0;
  return hh + mm / 60;
}
