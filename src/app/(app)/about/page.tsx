
'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Phone, MapPin, Ticket, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/logo';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto max-w-4xl py-12 md:py-16">
          <div className="space-y-12">
            <Card>
              <CardHeader className="text-center">
                 <div className="flex justify-center mb-4">
                    <Logo />
                 </div>
                <CardTitle className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">About the MUBAS Hub</CardTitle>
                <CardDescription className="max-w-xl mx-auto">
                    A central place for students of the Malawi University of Business and Applied Sciences to connect, share knowledge, and find solutions.
                </CardDescription>
              </CardHeader>
              <CardContent className="prose prose-lg max-w-none dark:prose-invert">
                <p>
                    The MUBAS Community Hub is a student-focused platform designed to foster collaboration and support. Whether you have a question about campus Wi-Fi, need help with the student portal (SMIS), or want to share a solution with your peers, this is the place to be.
                </p>
                <p>
                    Our mission is to create a self-sustaining knowledge base built by the community, for the community. By asking questions and providing answers, you contribute to a valuable resource that helps everyone at MUBAS succeed.
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Contact Us</CardTitle>
                        <CardDescription>Get in touch with the university administration.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-4">
                            <Mail className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold">Email</h4>
                                <a href="mailto:info@mubas.ac.mw" className="text-muted-foreground hover:text-primary transition-colors">
                                info@mubas.ac.mw
                                </a>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Phone className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold">Phone</h4>
                                <p className="text-muted-foreground">+265 1 870 648</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <MapPin className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold">Address</h4>
                                <p className="text-muted-foreground">Private Bag 303, Chichiri, Blantyre 3, Malawi</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Other Useful Links</CardTitle>
                        <CardDescription>Quick access to other important university systems.</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group p-3 rounded-lg hover:bg-muted transition-colors">
                             <Ticket className="h-6 w-6 text-primary flex-shrink-0" />
                             <div>
                                <h4 className="font-semibold group-hover:text-primary transition-colors">Helpdesk & Ticketing System</h4>
                                <p className="text-sm text-muted-foreground">Submit a support ticket for technical issues.</p>
                             </div>
                             <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                        </a>
                         <a href="https://www.mubas.ac.mw" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group p-3 rounded-lg hover:bg-muted transition-colors">
                             <Logo />
                             <div>
                                <h4 className="font-semibold group-hover:text-primary transition-colors">MUBAS Official Website</h4>
                                <p className="text-sm text-muted-foreground">Visit the main university website.</p>
                             </div>
                             <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                        </a>
                    </CardContent>
                </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
