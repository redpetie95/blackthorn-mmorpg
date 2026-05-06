'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface CharacterCreationModalProps {
  onCreate: (data: { name: string; class: string; avatar: string }) => Promise<void>;
}

const CLASSES = [
  { id: 'Knight', label: 'Knight', emoji: '🛡️', desc: 'Tanky protector of the realm' },
  { id: 'Rogue', label: 'Rogue', emoji: '🗡️', desc: 'Swift shadow in the night' },
  { id: 'Mage', label: 'Mage', emoji: '🔮', desc: 'Master of arcane forces' },
  { id: 'Archer', label: 'Archer', emoji: '🏹', desc: 'Deadly from afar' },
];

const AVATARS = [
  { id: '🛡️', label: 'Ironclad' },
  { id: '⚔️', label: 'Bladeborn' },
  { id: '🧙', label: 'Arcane' },
  { id: '🏹', label: 'Windshot' },
  { id: '🐺', label: 'Wolfrider' },
  { id: '🪓', label: 'Berserker' },
];

export default function CharacterCreationModal({ onCreate }: CharacterCreationModalProps) {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState(CLASSES[0].id);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Your legend needs a name, adventurer!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error: insertError } = await supabase
        .from('players')
        .insert({
          user_id: user.id,
          name: name.trim(),
          class: selectedClass,
          avatar: selectedAvatar,
          energy: 100,
          health: 100,
          gold: selectedClass === 'Knight' ? 300 : 250, // small class bonus
          level: 1,
          xp: 0,
        });

      if (insertError) throw insertError;

      await onCreate({
        name: name.trim(),
        class: selectedClass,
        avatar: selectedAvatar,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message.includes('unique') 
        ? 'That name is already taken!' 
        : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full mx-auto bg-[#2a1f14] border-4 border-[#d4af77] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#3d2a1f] px-8 py-6 text-center border-b-4 border-[#d4af77]">
          <h1 className="text-5xl font-serif text-[#f5e8c7] tracking-widest">FORGE YOUR LEGEND</h1>
          <p className="text-[#d4af77] mt-2">Choose your path, adventurer</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Name */}
          <div>
            <label className="block text-[#d4af77] text-sm mb-3 font-medium">YOUR NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="Sir Elandor"
              className="w-full bg-[#1f160f] border-2 border-[#d4af77] text-[#f5e8c7] px-6 py-5 rounded-2xl text-2xl focus:outline-none focus:border-[#f5e8c7]"
              autoFocus
            />
          </div>

          {/* Class Selection */}
          <div>
            <label className="block text-[#d4af77] text-sm mb-3 font-medium">YOUR CLASS</label>
            <div className="grid grid-cols-4 gap-3">
              {CLASSES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedClass(c.id)}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    selectedClass === c.id
                      ? 'border-[#f5e8c7] bg-[#3d2a1f]'
                      : 'border-[#8c6f4e] hover:border-[#d4af77]'
                  }`}
                >
                  <span className="text-4xl">{c.emoji}</span>
                  <span className="font-bold text-[#f5e8c7]">{c.label}</span>
                  <span className="text-xs text-[#d4af77] text-center leading-tight">{c.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="block text-[#d4af77] text-sm mb-3 font-medium">YOUR AVATAR</label>
            <div className="grid grid-cols-6 gap-3">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatar(av.id)}
                  className={`aspect-square text-5xl flex items-center justify-center rounded-2xl border-2 transition-all ${
                    selectedAvatar === av.id
                      ? 'border-[#f5e8c7] bg-[#3d2a1f] scale-110'
                      : 'border-[#8c6f4e] hover:border-[#d4af77]'
                  }`}
                >
                  {av.id}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-center bg-red-950/50 py-4 rounded-2xl text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8c2f2f] hover:bg-[#a53a3a] disabled:bg-[#5c1f1f] text-white font-bold text-3xl py-6 rounded-2xl border-2 border-[#d4af77] transition-all active:scale-95"
          >
            {loading ? 'FORGING YOUR FATE...' : 'BEGIN YOUR ADVENTURE'}
          </button>

          <p className="text-center text-[#8c6f4e] text-xs">
            Everything is saved forever • No email required
          </p>
        </form>
      </div>
    </div>
  );
}
