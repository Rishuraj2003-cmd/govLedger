import { useMemo, useState } from "react";
import { FlowTimeline } from "../components/FlowTimeline";
import { SectionTitle } from "../components/SectionTitle";

export function TransactionsPage({ transactions }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) {
      return transactions;
    }

    const lower = query.toLowerCase();
    return transactions.filter((tx) =>
      [tx.senderName, tx.receiverName, tx.txHash, tx.stage, String(tx.projectId)].some((value) =>
        value.toLowerCase().includes(lower),
      ),
    );
  }, [query, transactions]);

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Ledger Explorer"
        title="Search every blockchain-backed Bihar transaction"
        description="Auditors, officers, and citizens can search by district, role, recipient, project id, or transaction hash to quickly trace how funds moved."
      />

      <div className="glass-panel rounded-[28px] p-6 shadow-panel">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by district, role, project id, recipient, or transaction hash"
          className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none"
        />
      </div>

      <FlowTimeline transactions={filtered} />
    </div>
  );
}
