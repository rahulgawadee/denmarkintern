"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Euro, Building2 } from "lucide-react";

export function InternshipCard({ internship, onApply, locale = "da" }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl">{internship.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <Building2 className="h-4 w-4" />
              {internship.companyId?.companyName || "Company"}
            </CardDescription>
          </div>
          {internship.area && (
            <Badge variant="secondary">
              {Array.isArray(internship.area) ? internship.area.join(", ") : internship.area}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          {internship.companyId?.city && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {internship.companyId.city}
            </div>
          )}
          {internship.duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {internship.duration} {locale === "da" ? "uger" : "weeks"}
            </div>
          )}
          {internship.stipend && (
            <div className="flex items-center gap-1">
              <Euro className="h-4 w-4" />
              {internship.stipend.amount} DKK/{locale === "da" ? "md" : "month"}
            </div>
          )}
          {internship.workMode && (
            <Badge variant="outline" className="capitalize">
              {internship.workMode}
            </Badge>
          )}
        </div>
        
        {internship.description && (
          <p className="text-sm mb-4 line-clamp-2 text-zinc-700 dark:text-zinc-300">
            {internship.description}
          </p>
        )}
        
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onApply(internship)}>
            {locale === "da" ? "Ansøg nu" : "Apply Now"}
          </Button>
          <Button size="sm" variant="outline">
            {locale === "da" ? "Se detaljer" : "View Details"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
