'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Bell, Palette, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const [coachName, setCoachName] = useState('Coach');
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="max-w-[800px] mx-auto p-6 md:p-12">
      <div className="mb-[48px] pb-[48px] border-b-[1px] border-[#222a3514]">
        <h1 className="heading-lg text-[#242424] tracking-tight">Settings</h1>
      </div>

      <div className="space-y-12">
        {/* Profile Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <User size={20} className="text-[#898989]" />
            <h2 className="heading-sm text-[#242424]">Profile</h2>
          </div>
          <div className="bg-white rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[12px] bg-[#f5f5f5] shadow-[var(--shadow-level-1)] flex items-center justify-center text-[24px] font-bold text-[#242424] shrink-0">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[18px] font-semibold text-[#242424]">Jane Doe</p>
                <p className="text-[14px] font-light text-[#898989]">jane.doe@example.com</p>
              </div>
              <button className="text-[14px] font-semibold text-[#0099ff] hover:underline shrink-0">
                Edit
              </button>
            </div>
            <div className="border-t-[1px] border-[#222a3514] pt-6 grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[14px] font-medium text-[#242424] block mb-2">Display Name</label>
                <input
                  type="text"
                  defaultValue="Jane Doe"
                  className="w-full bg-white shadow-[var(--shadow-level-1)] border-[1px] border-[#222a3514] rounded-[8px] px-4 py-3 text-[16px] font-light text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-shadow"
                />
              </div>
              <div>
                <label className="text-[14px] font-medium text-[#242424] block mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="jane.doe@example.com"
                  className="w-full bg-white shadow-[var(--shadow-level-1)] border-[1px] border-[#222a3514] rounded-[8px] px-4 py-3 text-[16px] font-light text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-shadow"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Coach Customization */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Palette size={20} className="text-[#898989]" />
            <h2 className="heading-sm text-[#242424]">AI Coach</h2>
          </div>
          <div className="bg-white rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] p-6 md:p-8 space-y-6">
            <div>
              <label className="text-[14px] font-medium text-[#242424] block mb-2">Coach Name</label>
              <p className="text-[14px] font-light text-[#898989] mb-4 leading-[1.5]">
                Personalize how your AI coach addresses itself in conversations.
              </p>
              <input
                type="text"
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
                placeholder="e.g., Tutor, Mentor, Sensei"
                className="w-full max-w-[360px] bg-white shadow-[var(--shadow-level-1)] border-[1px] border-[#222a3514] rounded-[8px] px-4 py-3 text-[16px] font-light text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-shadow placeholder-[#898989]"
              />
            </div>
            <div className="border-t-[1px] border-[#222a3514] pt-6">
              <label className="text-[14px] font-medium text-[#242424] block mb-2">Coaching Style</label>
              <p className="text-[14px] font-light text-[#898989] mb-4 leading-[1.5]">
                Choose how the AI approaches teaching you new concepts.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {['Socratic', 'Direct', 'Encouraging'].map((style, i) => (
                  <button
                    key={style}
                    className={`p-4 rounded-[8px] text-[14px] font-semibold text-center transition-all ${
                      i === 0
                        ? 'bg-[#242424] text-white shadow-[var(--shadow-level-2)]'
                        : 'bg-white text-[#242424] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] hover:bg-[#f5f5f5]'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Bell size={20} className="text-[#898989]" />
            <h2 className="heading-sm text-[#242424]">Notifications</h2>
          </div>
          <div className="bg-white rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] divide-y divide-[#222a3514]">
            {[
              { title: 'Study Reminders', desc: 'Get notified when it\'s time to review a topic' },
              { title: 'Quiz Results', desc: 'Notifications when quiz results are ready' },
              { title: 'Weekly Progress Report', desc: 'Summary of your learning progress each week' },
            ].map((item, i) => (
              <div key={item.title} className="flex items-center justify-between p-6">
                <div>
                  <p className="text-[16px] font-medium text-[#242424]">{item.title}</p>
                  <p className="text-[14px] font-light text-[#898989] mt-1">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`w-[44px] h-[24px] rounded-[9999px] transition-colors relative shrink-0 ${
                    (i === 0 ? notifications : i === 1) ? 'bg-[#242424]' : 'bg-[#e5e5e5]'
                  }`}
                >
                  <div
                    className={`w-[20px] h-[20px] rounded-full bg-white shadow-[var(--shadow-level-2)] absolute top-[2px] transition-transform ${
                      (i === 0 ? notifications : i === 1) ? 'translate-x-[22px]' : 'translate-x-[2px]'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pb-12">
          <div className="bg-white rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[16px] font-medium text-[#242424]">Sign Out</p>
                <p className="text-[14px] font-light text-[#898989] mt-1">Sign out of your CoachClaw account.</p>
              </div>
              <Link href="/login" className="flex items-center gap-2 text-[14px] font-semibold text-[#898989] hover:text-[#242424] transition-colors">
                Sign Out
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
