'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Poppins } from 'next/font/google';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Separator } from '@/app/components/ui/separator';
import { FaInstagram, FaYoutube } from 'react-icons/fa';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'] });

const images = [
  { src: '/bangloreputreach.jpeg', label: 'Bangalore Outreach' },
  { src: '/beachfellowship.jpeg', label: 'Beach Fellowship' },
  { src: '/borivalioutreach.jpeg', label: 'Borivali Outreach' },
  { src: '/camp2025.jpg', label: 'Camp 2025' },
  { src: '/christmasfellowship.jpeg', label: 'Christmas Fellowship' },
  { src: '/feb_recollection.jpeg', label: 'February Recollection' },
  { src: '/fellowship.jpeg', label: 'Fellowship' },
  { src: '/k24.jpeg', label: 'K24' },
  { src: '/nvrecollec.jpeg', label: 'NV Recollection' },
  { src: '/orpahnagenv.jpeg', label: 'Orphanage NV' },
  { src: '/soprts.jpeg', label: 'Sports' },
];

export default function HomePage() {
  return (
    <main className={poppins.className}>
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-amber-50 via-white to-sky-50">
        <div className="absolute inset-0">
          <Image
            src="/camp2025.jpg"
            alt="CYP Camp 2025"
            fill
            className="object-cover brightness-[1.1] saturate-[1.1]"
            loading="eager"
            quality={90}
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow sm:text-5xl">
                Christian Youth in Power
                
              </h1>
              <p className="mt-3 text-base text-slate-100 drop-shadow sm:mt-4 sm:text-lg">
                A Youth Outreach of The Community of the Good Shepherd.
              </p>
              <div className="pt-8">
                <Button
                  asChild
                  size="lg"
                  className="w-fit bg-amber-400 text-slate-900 hover:bg-amber-500 shadow-lg ring-1 ring-white/60"
                >
                  <Link href="/join" aria-label="Get involved with Christian Youth in Power">
                    Get Involved Today
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center justify-between"
        >
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Recent Events
          </h2>
          <Separator className="ml-4 hidden flex-1 sm:block" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <div className="-mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-2">
              {images.map((img, i) => (
                <motion.div
                  key={img.src}
                  className="snap-start shrink-0 basis-72 sm:basis-80"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-slate-900">{img.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative h-44 w-full overflow-hidden rounded-lg">
                        <Image
                          src={img.src}
                          alt={img.label}
                          fill
                          sizes="(max-width: 768px) 320px, 400px"
                          className="object-cover"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section id="who-we-are" className="bg-gradient-to-b from-white to-amber-50/60">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Who We Are</h2>
            <p className="mt-3 max-w-3xl text-slate-700">
              Christian Youth in Power (CYP) is the Youth Outreach of The Community of the Good
              Shepherd — a covenanted SOS community. We are a movement of Christian youth who
              aspire to be and make disciples of Jesus Christ, evangelizing and forming future
              leaders in the power of the Holy Spirit for the Church and society.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8"
          >
            <div className="relative w-full overflow-hidden rounded-xl border border-sky-100 bg-white shadow-sm">
              <div className="relative aspect-video w-full">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/5I7pDz0WHlk"
                  title="CYP introduction video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center justify-between"
        >
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Connect With Us</h2>
          <Separator className="ml-4 hidden flex-1 sm:block" />
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Button
            asChild
            size="lg"
            className="w-full bg-gradient-to-r from-pink-500 to-amber-400 text-white hover:from-pink-600 hover:to-amber-500"
          >
            <Link
              href="https://www.instagram.com/cyp.vasai/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open CYP Vasai on Instagram"
            >
              <span className="mr-2 inline-flex items-center justify-center">
                <FaInstagram aria-hidden className="h-5 w-5" />
              </span>
              CYP Vasai
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="w-full bg-gradient-to-r from-pink-500 to-amber-400 text-white hover:from-pink-600 hover:to-amber-500"
          >
            <Link
              href="https://www.instagram.com/cyp.youngprofessionals/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open CYP Young Professionals on Instagram"
            >
              <span className="mr-2 inline-flex items-center justify-center">
                <FaInstagram aria-hidden className="h-5 w-5" />
              </span>
              Young Professionals
            </Link>
          </Button>
          <Button asChild size="lg" className="w-full bg-red-600 text-white hover:bg-red-700">
            <Link
              href="https://www.youtube.com/@cyp-vasai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open CYP Vasai on YouTube"
            >
              <span className="mr-2 inline-flex items-center justify-center">
                <FaYoutube aria-hidden className="h-5 w-5" />
              </span>
              YouTube Channel
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
