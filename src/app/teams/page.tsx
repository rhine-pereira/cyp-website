'use client';

import React, { useState, useRef, JSX } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  FaMusic,
  FaLaptopCode,
  FaPaintBrush,
  FaCamera,
  FaHandsHelping,
  FaArrowRight,
  FaTimes,
} from 'react-icons/fa';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';

// --- Data ---
type Team = {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { className?: string }>;
  color: string;
  gradient: string;
  bgGradient: string;
  roles: string[];
};

const teams: Team[] = [
  {
    id: 'music',
    name: 'Music Ministry',
    shortName: 'Music',
    tagline: 'The Sound of Worship',
    description:
      'We lead the congregation in worship, setting the atmosphere for the Holy Spirit to move. From vocalists to instrumentalists, we use our talents to glorify God.',
    icon: FaMusic,
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'radial-gradient(circle at 20% 50%, #451a03 0%, #000000 100%)',
    roles: ['Worship Leaders', 'Musicians', 'Choir', 'Sound Engineers'],
  },
  {
    id: 'tech',
    name: 'Technical Team',
    shortName: 'Tech',
    tagline: 'The Backbone',
    description:
      'We ensure everything runs smoothly behind the scenes. Lighting, sound, projection, and stage management - we are the invisible hands that make the service possible.',
    icon: FaLaptopCode,
    color: '#0EA5E9',
    gradient: 'from-sky-500 to-blue-600',
    bgGradient: 'radial-gradient(circle at 80% 20%, #0c4a6e 0%, #000000 100%)',
    roles: ['Lighting', 'Projection', 'Stage Management', 'Livestream'],
  },
  {
    id: 'creatives',
    name: 'Creatives Team',
    shortName: 'Create',
    tagline: 'The Vision',
    description:
      'We bring the message to life through visual arts. Graphic design, stage decoration, social media content, and branding - we paint the vision of the ministry.',
    icon: FaPaintBrush,
    color: '#D946EF',
    gradient: 'from-fuchsia-500 to-purple-600',
    bgGradient: 'radial-gradient(circle at 50% 50%, #4a044e 0%, #000000 100%)',
    roles: ['Graphic Design', 'Stage Decor', 'Content Creation', 'Branding'],
  },
  {
    id: 'media',
    name: 'Media Team',
    shortName: 'Media',
    tagline: 'The Lens',
    description:
      'Capturing moments that last a lifetime. Photography, videography, and editing - we tell the story of what God is doing in our community.',
    icon: FaCamera,
    color: '#10B981',
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'radial-gradient(circle at 30% 80%, #064e3b 0%, #000000 100%)',
    roles: ['Photography', 'Videography', 'Video Editing', 'Storytelling'],
  },
  {
    id: 'service',
    name: 'Service Team',
    shortName: 'Serve',
    tagline: 'The Heart',
    description:
      'We are the first face of the ministry. Ushers, greeters, and hospitality - we ensure everyone feels welcomed, loved, and at home.',
    icon: FaHandsHelping,
    color: '#F43F5E',
    gradient: 'from-rose-500 to-red-600',
    bgGradient: 'radial-gradient(circle at 70% 70%, #881337 0%, #000000 100%)',
    roles: ['Ushers', 'Greeters', 'Hospitality', 'Logistics'],
  },
];

// --- Components ---

const MobileTeamCard: React.FC<{ team: Team; index: number }> = ({ team }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { margin: '-20% 0px -20% 0px' });
  const Icon = team.icon;

  return (
    <div
      ref={ref}
      className="h-screen w-full snap-start relative flex flex-col justify-end p-6 overflow-hidden border-b border-white/5"
    >
      {/* Background */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-1000"
        style={{
          background: team.bgGradient,
          opacity: isInView ? 1 : 0.2,
        }}
      />

      {/* Noise Texture */}
      <div
        className="absolute inset-0 opacity-[0.05] z-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Big Typography Background */}
      <div className="absolute top-10 -right-10 z-0 opacity-10 select-none pointer-events-none">
        <h1 className="text-[20vh] font-black text-white leading-none tracking-tighter rotate-90 origin-top-right">
          {team.shortName.toUpperCase()}
        </h1>
      </div>

      {/* Content */}
      <div className="relative z-10 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div
            className="inline-flex items-center justify-center p-3 rounded-2xl mb-6 backdrop-blur-md border border-white/10"
            style={{ backgroundColor: `${team.color}20` }}
          >
            <Icon className="w-8 h-8" style={{ color: team.color }} />
          </div>
          <h2 className="text-5xl font-black text-white mb-2 tracking-tight uppercase">{team.name}</h2>
          <p className="text-xl font-light text-white/80 mb-6 italic">"{team.tagline}"</p>

          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-black/50 border-none"
            style={{ background: `linear-gradient(to right, ${team.color}, ${team.color}dd)` }}
          >
            Explore Team <FaArrowRight className="ml-2" />
          </Button>
        </motion.div>
      </div>

      {/* Modal/Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              layoutId={`modal-${team.id}`}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 h-[85vh] bg-[#121212] z-50 rounded-t-3xl border-t border-white/10 overflow-y-auto"
            >
              <div className="p-8 pb-32">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-1">{team.name}</h3>
                    <p className="text-white/50">{team.tagline}</p>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-2 bg-white/10 rounded-full text-white">
                    <FaTimes />
                  </button>
                </div>

                <p className="text-lg text-white/80 leading-relaxed mb-8">{team.description}</p>

                <div className="mb-8">
                  <h4 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">Roles & Opportunities</h4>
                  <div className="flex flex-wrap gap-3">
                    {team.roles.map((role, i) => (
                      <span key={i} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
                  <h4 className="text-xl font-bold text-white mb-2">Join the {team.shortName} Team</h4>
                  <p className="text-white/60 mb-6 text-sm">Ready to serve? We'd love to have you.</p>
                  <Button className="w-full font-bold text-black" style={{ backgroundColor: team.color }}>
                    Apply Now
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const DesktopTeamSlice: React.FC<{
  team: Team;
  isActive: boolean;
  onHover: () => void;
}> = ({ team, isActive, onHover }) => {
  const Icon = team.icon;

  return (
    <motion.div
      layout
      onHoverStart={onHover}
      className="relative h-full cursor-pointer overflow-hidden transition-all duration-700 ease-[0.22,1,0.36,1] border-r border-white/5 last:border-r-0 group"
      style={{
        flex: isActive ? 3 : 1,
        background: team.bgGradient,
      }}
    >
      {/* Overlay Gradient */}
      <div className={`absolute inset-0 bg-black/40 transition-opacity duration-500 ${isActive ? 'opacity-0' : 'opacity-60 group-hover:opacity-40'}`} />

      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col justify-between p-10">
        {/* Top Icon */}
        <div className={`transition-all duration-500 ${isActive ? 'scale-100 translate-y-0' : 'scale-75 -translate-y-4 opacity-70'}`}>
          <div
            className="inline-flex items-center justify-center p-4 rounded-2xl backdrop-blur-md border border-white/10"
            style={{ backgroundColor: `${team.color}20` }}
          >
            <Icon className="w-8 h-8" style={{ color: team.color }} />
          </div>
        </div>

        {/* Text Content */}
        <div className="relative z-10">
          <motion.h2
            layout="position"
            className={`font-black text-white uppercase tracking-tighter leading-none transition-all duration-500 ${
              isActive ? 'text-6xl mb-4' : 'text-4xl mb-2 opacity-80'
            }`}
          >
            {isActive ? team.name : team.shortName}
          </motion.h2>

          <AnimatePresence>
            {isActive && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <p className="text-xl text-white/80 font-light mb-8 max-w-xl">{team.description}</p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {team.roles.map((role, i) => (
                    <span key={i} className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-white/70 border border-white/5">
                      {role}
                    </span>
                  ))}
                </div>

                <Button className="rounded-full px-8 py-6 text-lg font-bold text-black" style={{ backgroundColor: team.color }}>
                  Join Team <FaArrowRight className="ml-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Vertical Text (Visible when NOT active) */}
      {!isActive && (
        <div className="absolute bottom-10 left-10 origin-bottom-left -rotate-90 translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 whitespace-nowrap">
          <span className="text-sm font-bold tracking-[0.3em] uppercase text-white/50">Click to Expand</span>
        </div>
      )}
    </motion.div>
  );
};

export default function TeamsPage(): JSX.Element {
  const [activeTeamId, setActiveTeamId] = useState<string>('music');

  return (
    <main className="bg-black min-h-screen text-white overflow-hidden">
      {/* Mobile View: Vertical Snap Scroll */}
      <div className="lg:hidden h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar">
        {teams.map((team, index) => (
          <MobileTeamCard key={team.id} team={team} index={index} />
        ))}

        {/* Mobile Footer/Call to Action */}
        <div className="h-[50dvh] snap-start bg-[#111] flex flex-col items-center justify-center p-8 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4 text-white">Don't see your fit?</h2>
          <p className="text-white/60 mb-8">We are always looking for new talents and hearts willing to serve. Reach out to us!</p>
          <Button asChild className="rounded-full px-8 py-6 text-lg font-bold bg-white text-black hover:bg-gray-200 border-none">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>

      {/* Desktop View: Horizontal Accordion */}
      <div className="hidden lg:flex h-screen w-full overflow-hidden">
        {teams.map((team) => (
          <DesktopTeamSlice key={team.id} team={team} isActive={activeTeamId === team.id} onHover={() => setActiveTeamId(team.id)} />
        ))}
      </div>
    </main>
  );
}
