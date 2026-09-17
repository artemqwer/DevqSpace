"use client";

import React, { useState } from "react";
import type { Product } from "@/lib/products";
import { Plus, CheckCircle, ChartLineUp, UserPlus, Funnel, Kanban } from "@phosphor-icons/react";

type DealStage = "New Lead" | "Proposal" | "In Review" | "Closed Won";

type Lead = {
  id: string;
  name: string;
  deal: number;
  stage: DealStage;
  contact: string;
  days: string;
};

export function CrmDemo({ product }: { product?: Product }) {
  const [activeTab, setActiveTab] = useState<"pipeline" | "analytics">("pipeline");
  const [leads, setLeads] = useState<Lead[]>([
    { id: "l1", name: "Apex FinTech", deal: 14000, stage: "Proposal", contact: "@alex_apex", days: "2d ago" },
    { id: "l2", name: "Solana Staking DAO", deal: 8500, stage: "In Review", contact: "dao@sol.org", days: "4d ago" },
    { id: "l3", name: "CoffeeChain App", deal: 4200, stage: "Closed Won", contact: "+380 67 123 45", days: "1w ago" },
    { id: "l4", name: "Vortex Media Group", deal: 6800, stage: "New Lead", contact: "ceo@vortex.media", days: "1d ago" },
  ]);

  const [addModal, setAddModal] = useState(false);
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadDeal, setNewLeadDeal] = useState("5000");
  const [newLeadContact, setNewLeadContact] = useState("");
  const [newLeadStage, setNewLeadStage] = useState<DealStage>("New Lead");

  const stages: DealStage[] = ["New Lead", "Proposal", "In Review", "Closed Won"];

  const handleMoveStage = (id: string, nextStage: DealStage) => {
    setLeads(leads.map((l) => (l.id === id ? { ...l, stage: nextStage } : l)));
  };

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim()) return;

    const newLead: Lead = {
      id: `l-${Date.now()}`,
      name: newLeadName.trim(),
      deal: parseFloat(newLeadDeal) || 3000,
      stage: newLeadStage,
      contact: newLeadContact.trim() || "@client_direct",
      days: "just now",
    };

    setLeads([...leads, newLead]);
    setNewLeadName("");
    setNewLeadContact("");
    setAddModal(false);
  };

  const totalPipeline = leads.reduce((sum, l) => sum + l.deal, 0);
  const closedWonTotal = leads.filter((l) => l.stage === "Closed Won").reduce((sum, l) => sum + l.deal, 0);

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto space-y-8 antialiased font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-xs font-mono uppercase text-cyan-400 font-bold">
            Mini CRM &amp; Deal Pipeline Template
          </span>
          <h1 className="text-2xl font-bold text-white mt-0.5">Agency Sales Pipeline</h1>
          <p className="text-xs text-slate-400">
            Kanban workflow, deal stage automation, and revenue analytics for agile agencies.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex bg-slate-900 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "pipeline" ? "bg-cyan-500 text-black font-bold" : "text-slate-400"
              }`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "analytics" ? "bg-cyan-500 text-black font-bold" : "text-slate-400"
              }`}
            >
              Analytics
            </button>
          </div>

          <button
            onClick={() => setAddModal(true)}
            className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition flex items-center gap-1.5 shadow"
          >
            <Plus weight="bold" className="h-3.5 w-3.5" />
            <span>+ Новий лід</span>
          </button>
        </div>
      </div>

      {/* TAB 1: KANBAN PIPELINE */}
      {activeTab === "pipeline" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stages.map((stg) => {
            const stageLeads = leads.filter((l) => l.stage === stg);
            const stageSum = stageLeads.reduce((s, l) => s + l.deal, 0);
            return (
              <div
                key={stg}
                className="p-4 rounded-2xl bg-[#0e121a] border border-white/10 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex justify-between items-center pb-2 border-b border-white/10 text-xs font-mono">
                    <span className="font-bold text-white uppercase">{stg}</span>
                    <span className="text-cyan-400 font-bold">${stageSum.toLocaleString()}</span>
                  </div>

                  <div className="space-y-3 pt-3">
                    {stageLeads.length === 0 ? (
                      <div className="text-[11px] font-mono text-slate-500 text-center py-6">
                        Порожньо
                      </div>
                    ) : (
                      stageLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="p-4 rounded-xl bg-[#141924] border border-white/5 space-y-3 shadow-md"
                        >
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-white font-bold text-sm truncate">{lead.name}</span>
                            <span className="text-slate-500 text-[10px]">{lead.days}</span>
                          </div>

                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-slate-400 text-[11px] truncate">{lead.contact}</span>
                            <span className="text-emerald-400 font-black">${lead.deal.toLocaleString()}</span>
                          </div>

                          {/* Stage Transition Buttons */}
                          <div className="pt-2 border-t border-white/5 flex gap-1 justify-end text-[10px] font-mono">
                            {stg !== "Closed Won" && (
                              <button
                                onClick={() =>
                                  handleMoveStage(
                                    lead.id,
                                    stages[stages.indexOf(stg) + 1]
                                  )
                                }
                                className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-black transition"
                              >
                                Вперед →
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-6 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0e121a] border border-white/10 space-y-1">
              <div className="text-slate-400">TOTAL PIPELINE VALUE</div>
              <div className="text-3xl font-black text-white">${totalPipeline.toLocaleString()}</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#0e121a] border border-emerald-500/30 space-y-1">
              <div className="text-slate-400">CLOSED WON REVENUE</div>
              <div className="text-3xl font-black text-emerald-400">${closedWonTotal.toLocaleString()}</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#0e121a] border border-cyan-500/30 space-y-1">
              <div className="text-slate-400">WIN RATE CONVERSION</div>
              <div className="text-3xl font-black text-cyan-300">
                {((closedWonTotal / (totalPipeline || 1)) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleAddLead}
            className="p-6 rounded-3xl bg-[#0e121a] border border-cyan-500/30 max-w-sm w-full space-y-4 shadow-2xl font-mono text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="font-bold text-white text-sm">Додати нового ліда</span>
              <button
                type="button"
                onClick={() => setAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Назва компанії / проєкту:</label>
              <input
                type="text"
                required
                value={newLeadName}
                onChange={(e) => setNewLeadName(e.target.value)}
                placeholder="e.g. NextGen Studio"
                className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Очікувана сума угоди ($):</label>
              <input
                type="number"
                required
                value={newLeadDeal}
                onChange={(e) => setNewLeadDeal(e.target.value)}
                className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Контактний Telegram / Email:</label>
              <input
                type="text"
                value={newLeadContact}
                onChange={(e) => setNewLeadContact(e.target.value)}
                placeholder="@username або email"
                className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition shadow"
            >
              Створити лід в системі →
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
