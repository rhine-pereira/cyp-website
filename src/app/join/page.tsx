"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { MapPin, Clock } from "lucide-react";

const mapsUrl = "https://maps.app.goo.gl/q2GgBCUyaGfCgj7RA";
const mapsEmbed = "https://www.google.com/maps?q=Jeevan+Darshan+Kendra,+Giriz&output=embed";

// Warm Espresso Theme Colors
const theme = {
  background: '#1C1917',
  surface: '#1C1917',
  primary: '#FB923C',
  text: '#FAFAFA',
  border: '#FB923C30',
};

export default function JoinPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: theme.background }}>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 opacity-10 blur-3xl bg-[radial-gradient(circle_at_20%_20%,#FB923C,transparent_40%),radial-gradient(circle_at_80%_30%,#FCD34D,transparent_40%),radial-gradient(circle_at_50%_80%,#FB923C,transparent_40%)]" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex items-center justify-between"
          >
            <h1 className="text-3xl font-bold uppercase tracking-[-0.02em] sm:text-4xl" style={{ color: theme.text }}>
              Join CYP
            </h1>
            <div className="ml-4 hidden flex-1 sm:block h-px opacity-20" style={{ backgroundColor: theme.text }} />
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <CardHeader>
                  <CardTitle className="text-2xl" style={{ color: theme.text }}>Join us at Jeevan Darshan Kendra, Giriz</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                        <MapPin className="h-6 w-6" style={{ color: theme.primary }} />
                      </div>
                      <div>
                        <p className="font-semibold text-lg" style={{ color: theme.text }}>Jeevan Darshan Kendra, Giriz</p>
                        <p className="opacity-70" style={{ color: theme.text }}>Vasai</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                        <Clock className="h-6 w-6" style={{ color: theme.primary }} />
                      </div>
                      <p className="font-medium" style={{ color: theme.text }}>Every Monday, 7:00 PM – 9:00 PM</p>
                    </div>
                    <div className="pt-4">
                      <Button asChild size="lg" className="w-full sm:w-auto font-semibold" style={{ backgroundColor: theme.primary, color: '#1C1917' }}>
                        <Link href={mapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Open location in Google Maps">
                          Open in Google Maps
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="relative overflow-hidden rounded-xl border shadow-2xl" style={{ borderColor: theme.border }}>
                <div className="relative aspect-video w-full bg-gray-900">
                  <iframe
                    className="h-full w-full opacity-90 hover:opacity-100 transition-opacity"
                    src={mapsEmbed}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    aria-label="Map for Jeevan Darshan Kendra, Giriz"
                    style={{ filter: 'invert(90%) hue-rotate(180deg) contrast(90%)' }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
