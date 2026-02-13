"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FormLayout } from "@/app/types/form";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Calendar, Users, Eye, ClipboardList } from "lucide-react";
import Image from "next/image";
import Spinner from "@/app/components/Spinner";

// Warm Espresso Theme Colors
const theme = {
  background: '#1C1917',
  surface: '#1C1917',
  primary: '#FB923C',
  text: '#FAFAFA',
  border: '#FB923C30',
};

export default function FormsPage() {
  const [forms, setForms] = useState<FormLayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await fetch('/api/forms/list', { cache: 'no-store' });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Failed to load forms');
        const result: FormLayout[] = (json.forms ?? []).map((f: Record<string, unknown>) => ({
          ...f,
          createdAt: f.createdAt ? new Date(f.createdAt as string) : new Date(),
          updatedAt: f.updatedAt ? new Date(f.updatedAt as string) : new Date(),
        }));
        setForms(result);
      } catch (e) {
        setError("Failed to load forms");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  return (
    <main className="min-h-screen" style={{ backgroundColor: theme.background }}>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 opacity-10 blur-3xl bg-[radial-gradient(circle_at_20%_20%,#FB923C,transparent_40%),radial-gradient(circle_at_80%_30%,#FCD34D,transparent_40%),radial-gradient(circle_at_50%_80%,#FB923C,transparent_40%)]" />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex items-center justify-between"
          >
            <h1 className="text-3xl font-bold uppercase tracking-[-0.02em] sm:text-4xl" style={{ color: theme.text }}>Available Forms</h1>
            <div className="ml-4 hidden flex-1 sm:block h-px opacity-20" style={{ backgroundColor: theme.text }} />
          </motion.div>

          {loading && (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Spinner
                label="Loading forms..."
                trackClassName="border-white/20"
                ringClassName="border-t-[#FB923C]"
                labelClassName="text-[#FAFAFA]"
              />
            </div>
          )}

          {error && !loading && (
            <div className="mx-auto max-w-xl rounded-lg border border-red-400 bg-red-900/20 p-4 text-red-200">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {forms.length === 0 && (
                <motion.div
                  className="sm:col-span-2 lg:col-span-3"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="overflow-hidden border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-yellow-500/5" />
                      <div className="relative p-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 shadow-sm border border-white/10">
                          <ClipboardList className="h-7 w-7" style={{ color: theme.primary }} />
                        </div>
                        <CardTitle className="mb-2 text-xl" style={{ color: theme.text }}>No Forms Available</CardTitle>
                        <p className="mx-auto mb-6 max-w-2xl opacity-70" style={{ color: theme.text }}>
                          There are currently no active forms to fill out. Check back soon or connect with us to stay updated on upcoming registrations and sign-ups.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-center">
                          <Button asChild variant="outline" style={{ borderColor: theme.primary, color: theme.primary, backgroundColor: 'transparent' }} className="hover:bg-white/5">
                            <Link href="/join" aria-label="Join Christian Youth in Power">
                              Join CYP
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {forms.map((form, i) => (
                <motion.div
                  key={form.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Card className="overflow-hidden border h-full flex flex-col" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                    {form.imageUrl && (
                      <div className="relative h-44 w-full overflow-hidden bg-gray-900">
                        <Image src={form.imageUrl} alt={form.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover opacity-90 hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <CardTitle className="line-clamp-2 text-xl" style={{ color: theme.text }}>{form.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      {form.description && (
                        <p className="mb-4 line-clamp-3 opacity-70 flex-1" style={{ color: theme.text }}>{form.description}</p>
                      )}
                      <div className="mb-3 flex items-center text-sm opacity-60" style={{ color: theme.text }}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Created {form.createdAt?.toLocaleDateString?.() ?? ""}
                      </div>
                      <div className="mb-6 flex items-center text-sm opacity-60" style={{ color: theme.text }}>
                        <Users className="mr-2 h-4 w-4" />
                        {form.fields.length} field{form.fields.length !== 1 ? "s" : ""}
                      </div>
                      <Button asChild size="md" className="w-full font-semibold mt-auto" style={{ backgroundColor: theme.primary, color: '#1C1917' }}>
                        <Link href={`/forms/${form.id}`} aria-label={`Open form ${form.title}`}>
                          <span className="mr-2 inline-flex items-center justify-center align-middle"><Eye className="h-4 w-4" /></span>
                          Fill Out Form
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}