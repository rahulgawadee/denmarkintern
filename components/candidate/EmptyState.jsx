"use client";

import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        {Icon && <Icon className="h-12 w-12 mx-auto text-zinc-400 mb-4" />}
        {title && <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{title}</h3>}
        <p className="text-zinc-500 dark:text-zinc-400">{description}</p>
      </CardContent>
    </Card>
  );
}
