import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MessageSquareQuote, Sparkles } from 'lucide-react';
import TestimonialsManager from '@/components/admin/TestimonialsManager';

export default function Testimonials() {
  return (
    <div className="admin-page space-y-5 lg:space-y-6">
      <section className="admin-panel border-border/70 bg-gradient-to-r from-amber-50 via-background to-orange-50">
        <div className="admin-panel-body space-y-3">
          <Badge className="w-fit gap-1 rounded-full bg-primary/10 text-primary hover:bg-primary/10">
            <Sparkles className="h-3.5 w-3.5" />
            Testimonials Experience
          </Badge>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Program Testimonials
              </h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                A cleaner and modern workspace to manage student success stories.
              </p>
            </div>
            <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-auto lg:min-w-[360px]">
              <Card className="border-border/70 bg-card/80">
                <CardContent className="flex items-center gap-3 p-3">
                  <MessageSquareQuote className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Focus</p>
                    <p className="text-sm font-medium text-foreground">Content Quality</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/70 bg-card/80">
                <CardContent className="flex items-center gap-3 p-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Goal</p>
                    <p className="text-sm font-medium text-foreground">Higher Trust</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <TestimonialsManager />
    </div>
  );
}
