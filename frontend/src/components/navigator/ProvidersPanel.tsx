import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Video, MapPin, Star, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
interface ProvidersPanelProps {
  doctors: any[];
  onSelectProvider: (provider: any, type: string) => void;
  onBook: (providerId: string) => void;
}
export const ProvidersPanel: React.FC<ProvidersPanelProps> = ({
  doctors,
  onSelectProvider,
  onBook,
}) => {
  return (
    <Card className="h-full flex flex-col border-none shadow-none">
      {" "}
      <CardHeader className="px-0 pt-0">
        {" "}
        <CardTitle>AI Matched Specialists</CardTitle>{" "}
      </CardHeader>{" "}
      <CardContent className="px-0 flex-1 overflow-hidden">
        {" "}
        <ScrollArea className="h-[600px] pr-4">
          {" "}
          {doctors ? (
            <div className="space-y-4">
              {" "}
              {doctors.map((doc, idx) => (
                <div
                  key={doc.id}
                  onClick={() => onSelectProvider(doc, "doctor")}
                  className="p-4 rounded-xl border bg-card hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:shadow-md relative overflow-hidden"
                >
                  {" "}
                  {idx === 0 && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                      {" "}
                      TOP MATCH ({doc.match_score}){" "}
                    </div>
                  )}{" "}
                  <div className="flex justify-between items-start mb-1 mt-1">
                    {" "}
                    <span className="font-bold text-base">{doc.name}</span>{" "}
                  </div>{" "}
                  <p className="text-sm text-primary font-medium mb-2">
                    {doc.specialization}
                  </p>{" "}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    {" "}
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />{" "}
                      {doc.rating}
                    </span>{" "}
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {doc.location}
                    </span>{" "}
                    {doc.telemedicine_support && (
                      <span className="flex items-center gap-1 text-blue-500">
                        <Video className="w-3 h-3" /> Telemed
                      </span>
                    )}{" "}
                  </div>{" "}
                  <div className="flex justify-between items-center mt-4">
                    {" "}
                    <span className="text-xs font-semibold bg-muted px-2 py-1 rounded">
                      Fee: ${doc.consultation_fee}
                    </span>{" "}
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBook(doc.id);
                      }}
                    >
                      {" "}
                      <CalendarPlus className="w-4 h-4 mr-2" /> Book{" "}
                    </Button>{" "}
                  </div>{" "}
                </div>
              ))}{" "}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Loading providers...
            </div>
          )}{" "}
        </ScrollArea>{" "}
      </CardContent>{" "}
    </Card>
  );
};
