"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";

const statusConfig = {
  pending: {
    label: { en: "Pending", da: "Afventer" },
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  reviewing: {
    label: { en: "Reviewing", da: "Under gennemgang" },
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  shortlisted: {
    label: { en: "Shortlisted", da: "Udvalgt" },
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  offer_sent: {
    label: { en: "Offer Sent", da: "Tilbud sendt" },
    color: "bg-green-100 text-green-800 border-green-200",
  },
  accepted: {
    label: { en: "Accepted", da: "Accepteret" },
    color: "bg-green-600 text-white border-green-700",
  },
  rejected: {
    label: { en: "Rejected", da: "Afvist" },
    color: "bg-red-100 text-red-800 border-red-200",
  },
};

export function ApplicationCard({ application, onViewDetails, locale = "da" }) {
  const status = application.status || "pending";
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {application.internshipId?.title || "Internship Title"}
            </CardTitle>
            <CardDescription className="mt-1">
              {application.internshipId?.companyId?.companyName || "Company"}
            </CardDescription>
            <p className="text-xs text-zinc-500 mt-2">
              {locale === "da" ? "Ansøgt den" : "Applied on"}{" "}
              {new Date(application.createdAt).toLocaleDateString(
                locale === "da" ? "da-DK" : "en-US"
              )}
            </p>
          </div>
          <Badge className={`${config.color} border whitespace-nowrap`}>
            {config.label[locale] || config.label.en}
          </Badge>
        </div>
        
        {application.coverLetter && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
              <FileText className="inline h-3 w-3 mr-1" />
              {application.coverLetter.substring(0, 150)}...
            </p>
          </div>
        )}
        
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(application)}
          >
            <Eye className="h-4 w-4 mr-1" />
            {locale === "da" ? "Se detaljer" : "View Details"}
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}
