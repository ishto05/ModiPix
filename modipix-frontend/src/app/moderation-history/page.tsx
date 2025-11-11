"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

const ModerationHistoryDashboard = () => {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  const moderationData = [
    {
      id: 1,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCzwcNBjeDD8lwTv_gWl_xgo8XlMn7Vz3W_o8FxmcmDP9oMK8m1GIyV8_Lj7iiV3xv1zp8lW57q5xqMdjKy5XNtybPGi34Y5Dr7pOx7Ydh-_rch3vKjafyMQSmbaKMf5Q5ug2hs4ENmdaf120zMABtW8dR0q6oQ3jpVKVPCEeAfyxJrTmxHj6i7WJer8GqpARnUgKzjMxb8Kq2rLutUjvKbUpyqBy6Lv6QL8Uv3875WoN8F_zeRLZnrRlSTYcOXDBYxHcFNMZL0KwI",
      riskScore: "Low",
      riskScoreColor: "bg-green-100 text-green-800",
      decision: "Approved",
      decisionColor: "bg-blue-100 text-blue-800",
      timestamp: "2024-07-26 10:00 AM",
    },
    {
      id: 2,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDGiaUdQnZe4BC6v-MCmLc3cydTOpUsqgP_lUWq3hdQq-WZmUeM5CP0fRuYzbU7xmoQAxU5-BYF-FLjq_t63nDwCQ-1wIroz80cwB1J1ggSAYfnTBvLMTLzBMtT08Y6AqaTtwYlZQFueIuH3dKKl3Wm6pt4TcgWvDL9-OXo3OCjS7O9gSs_WLcdkEiSKpL7Q0a6RigD_c94j6HxBgZajnoeZDlnrV8DsXi6wrUVbNUjwY6B6H7g-aFMrKn7Kyv_r94SFyZ7ppzAWp8",
      riskScore: "Medium",
      riskScoreColor: "bg-yellow-100 text-yellow-800",
      decision: "Flagged",
      decisionColor: "bg-yellow-100 text-yellow-800",
      timestamp: "2024-07-26 11:30 AM",
    },
    {
      id: 3,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCjfZa8uyW7hVBAIp16ml_qN0BI5EvtWp5WRLMIenQghDQK2bHdBX4d-bByK9KqFfasq-UVdh0O_c0yvHoo97Dj3GeWhlAtqCxyrYszXnOOYqcJWQe2OMvcx05DsLelSqOixjGqxD2-R0_mIz8xcMpwz_2lB09D0ocZUBxXMPrwLtLAT6IK9DuQEeMN1MpCTxsJhatit-VvQ_TLgJJ8wftoPPWiwYKc-FobMaNnStHNTqGY22RMvbSNZPJtkOMSlB4hLn9GaT15NFs",
      riskScore: "Low",
      riskScoreColor: "bg-green-100 text-green-800",
      decision: "Approved",
      decisionColor: "bg-blue-100 text-blue-800",
      timestamp: "2024-07-26 01:00 PM",
    },
    {
      id: 4,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCJo9tjTyVx0zdnrBlUVJ-e0aVen_xtAbfk8AhtzwZhl2_H5molkE1Q4AMrkrwgGocUlagfA3J-zucb3KVLjkcVzUJ5S4ymnpd6C6T9L6hk95xOY5o9yDDcs4RtxleGlJpfXl_OXd7hxJHSQyshN_30MovR6og8JyPG4E-tKQNw79mjYZM1fAskR0uzseIiXDdF_c8K9zWfbfS8dQ7nc7PkAaVrv459ObDfcmriUCRCOJ4G3Lxacq19L5mRbxTnEGMeUDLcxVUOGtU",
      riskScore: "High",
      riskScoreColor: "bg-red-100 text-red-800",
      decision: "Rejected",
      decisionColor: "bg-red-100 text-red-800",
      timestamp: "2024-07-26 02:45 PM",
    },
    {
      id: 5,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAAZZUxOrjOcrednbobHDbbUdgkwTVAlIMK0HP55_VgkRte7a-eCd8VoJ43CrUIYK2tZIdf9U4-PzLYaNlnzWyJWk2eLOcX-Vuemwevw-RXIDG1m-tcJBhuQ9MskVjaV3lGsqg0ovbPn2mbxnGoeDBb8GL5v92Xzr6awmJcCHMiVC7EZLdvvVJl70LL6TtEDCt04BHvCcmJHzj6hlx23VPGmUJJsNDka6R0_D-mokSnwMKbL5qn3Y3xyoAf7Ei9alJvm1xh9VTRCVg",
      riskScore: "Low",
      riskScoreColor: "bg-green-100 text-green-800",
      decision: "Approved",
      decisionColor: "bg-blue-100 text-blue-800",
      timestamp: "2024-07-26 04:20 PM",
    },
    {
      id: 6,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCZthxSXFA2XbohEiNvRnsJoFsfJS0gBHTOkYuLroumv_TLReMiWoO_IE4PlDRJgT0VcKcNWBk-ofvzIr3eRN25B3Batoytcd2R8l9MF8c5LlpqlQu7Vjmhk8-C34bJO7_teEZWurrSKz80Uxwg-ppIc1cm6ZrGPUCQmzS4Ztn93rh-cRtIuUWpD2astq2JCAUIvyCkjhZcP_H9r4r2Eht2E3WnLN3LYQA4garPATrCZ8DZ2SG7Im9_E6S9X6dIiaylmXvdWDJP8zM",
      riskScore: "Medium",
      riskScoreColor: "bg-yellow-100 text-yellow-800",
      decision: "Flagged",
      decisionColor: "bg-yellow-100 text-yellow-800",
      timestamp: "2024-07-26 06:00 PM",
    },
    {
      id: 7,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA4zeAeFNo3C_aaj92hYAg9afbTdb7ToA71OS_9WT3bZNjxJKb3RAMe1PRJ7dhzDtXCyrG1wv4Va8fyHTvWLnnh0mMGFMyeb5t20UxnbZinfwfs0JrqYCIfd23Fzi-gSegJJeyVrTQrXAR1-COjLAvpudcOXKye_IEaiDB2IyPjLOVyvF_SLRlFvB2sCAUJypp_ncsJJXqVEEyNXkq_PKRO7pCA9bY8maruUElY0ggw_gSRCYMYAIVZUp8TpPfT-Bu-szVJ56UnUkI",
      riskScore: "Low",
      riskScoreColor: "bg-green-100 text-green-800",
      decision: "Approved",
      decisionColor: "bg-blue-100 text-blue-800",
      timestamp: "2024-07-26 07:30 PM",
    },
  ];

  return (
    <>
      <style jsx>{`
        :root {
          --primary-color: #1773cf;
          --secondary-color: #f8fafc;
          --text-primary: #111827;
          --text-secondary: #6b7280;
        }
        .hover-row:hover {
          background-color: var(--secondary-color);
        }
        .hover-row .actions {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .hover-row:hover .actions {
          opacity: 1;
        }
      `}</style>

      <SignedIn>
        <div
          className="w-full min-h-screen bg-background text-foreground"
          style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
        >
          {/* Main Content */}
          <main className="w-full p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto max-w-7xl">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Moderation History
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  Review past uploads, results, and timestamps.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg shadow-sm p-4 sm:p-6">
                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                  <div className="relative w-full sm:flex-grow sm:max-w-lg">
                    <input
                      className="form-input w-full rounded-md border border-input bg-background pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-ring text-foreground"
                      placeholder="Search by ID, name or status..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-md bg-secondary px-3 sm:px-4 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors">
                      <span className="hidden sm:inline">Date</span>
                      <span className="sm:hidden">📅</span>
                      <span className="material-symbols-outlined text-lg text-gray-500 hidden sm:inline">
                        expand_more
                      </span>
                    </button>
                    <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-md bg-secondary px-3 sm:px-4 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors">
                      <span className="hidden sm:inline">Risk Score</span>
                      <span className="sm:hidden">⚠️</span>
                      <span className="material-symbols-outlined text-lg text-gray-500 hidden sm:inline">
                        expand_more
                      </span>
                    </button>
                    <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-md bg-secondary px-3 sm:px-4 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors">
                      <span className="hidden sm:inline">Decision</span>
                      <span className="sm:hidden">✅</span>
                      <span className="material-symbols-outlined text-lg text-gray-500 hidden sm:inline">
                        expand_more
                      </span>
                    </button>
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-200">
                      <tr className="text-left text-gray-500 font-semibold">
                        <th className="px-4 py-3">Image</th>
                        <th className="px-4 py-3">Risk Score</th>
                        <th className="px-4 py-3">Decision</th>
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-800">
                      {moderationData.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`hover-row transition-colors ${
                            index < moderationData.length - 1
                              ? "border-b border-gray-100"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <img
                              alt="Moderated image"
                              className="rounded-md size-10 object-cover"
                              src={item.image}
                              onClick={() => {
                                const params = new URLSearchParams({
                                  id: String(item.id),
                                  image: item.image,
                                  riskScore: item.riskScore,
                                  decision: item.decision,
                                  timestamp: item.timestamp,
                                  source: "moderation-history",
                                });
                                router.push(`/test?${params.toString()}`);
                              }}
                              style={{ cursor: "pointer" }}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.riskScoreColor}`}
                            >
                              {item.riskScore}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.decisionColor}`}
                            >
                              {item.decision}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {item.timestamp}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              className="actions text-gray-500 hover:text-[var(--primary-color)] transition-colors p-2"
                              onClick={() => {
                                const params = new URLSearchParams({
                                  id: String(item.id),
                                  image: item.image,
                                  riskScore: item.riskScore,
                                  decision: item.decision,
                                  timestamp: item.timestamp,
                                  source: "moderation-history",
                                });
                                router.push(`/test?${params.toString()}`);
                              }}
                            >
                              <span className="material-symbols-outlined">
                                View
                              </span>
                            </button>
                            <button className="actions text-gray-500 hover:text-[var(--primary-color)] transition-colors">
                              <span className="material-symbols-outlined">
                                Delete
                              </span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {moderationData.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <img
                          alt="Moderated image"
                          className="rounded-md w-16 h-16 object-cover"
                          src={item.image}
                        />
                        <button className="text-gray-500 hover:text-[var(--primary-color)] transition-colors">
                          <span className="material-symbols-outlined">
                            View
                          </span>
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 font-medium">
                            Risk Score:
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.riskScoreColor}`}
                          >
                            {item.riskScore}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 font-medium">
                            Decision:
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.decisionColor}`}
                          >
                            {item.decision}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 font-medium">
                            Timestamp:
                          </span>
                          <span className="text-sm text-gray-500">
                            {item.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default ModerationHistoryDashboard;
