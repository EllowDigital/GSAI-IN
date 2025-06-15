
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EventImageUploader from "./EventImageUploader";
import Spinner from "@/components/ui/spinner";
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type EventRow = Tables<"events">;

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEvent: EventRow | null;
}

const EMPTY: Partial<EventRow> = {
  title: "",
  description: "",
  image_url: "",
  from_date: "",
  end_date: "",
  tag: "",
};

const AdminEventFormModal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  editingEvent,
}) => {
  const [form, setForm] = useState<Partial<EventRow>>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (editingEvent) {
      setForm(editingEvent);
      setImagePreview(editingEvent.image_url ?? null);
    } else {
      setForm(EMPTY);
      setImagePreview(null);
    }
    setImageFile(null);
  }, [editingEvent, open]);

  const handleChange = (key: keyof EventRow, value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleDateChange = (key: "from_date" | "end_date", date: Date | undefined) => {
    handleChange(key, date ? date.toISOString().slice(0, 10) : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.title?.trim() ||
      !form.description?.trim() ||
      !form.from_date ||
      !form.end_date
    ) {
      toast.error("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      let image_url = form.image_url ?? "";

      // If new image selected, upload
      if (imageFile) {
        const filename = `${Date.now()}-${imageFile.name}`;
        const { data, error } = await supabase.storage
          .from("events")
          .upload(filename, imageFile, { upsert: true });
        if (error) {
          toast.error("Image upload failed: " + error.message);
          setLoading(false);
          console.error("Image upload error:", error);
          return; // Abort submission if the upload fails
        }
        const { data: publicUrlData } = supabase.storage
          .from("events")
          .getPublicUrl(filename);
        if (publicUrlData?.publicUrl) {
          image_url = publicUrlData.publicUrl;
        } else {
          toast.error("Failed to retrieve image URL after upload.");
          setLoading(false);
          console.error("Missing publicUrl after upload");
          return;
        }
      }

      // DEBUGGING: LOG THE SESSION EMAIL BEFORE SAVE
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("DEBUG: Current Supabase session email:", sessionData?.session?.user?.email);

      if (editingEvent) {
        // Update
        const { error } = await supabase
          .from("events")
          .update({
            title: form.title,
            description: form.description,
            image_url,
            from_date: form.from_date,
            end_date: form.end_date,
            tag: form.tag,
          })
          .eq("id", editingEvent.id);
        if (error) {
          toast.error("Failed to update event: " + error.message);
          console.error("DEBUG: Update error:", error);
          setLoading(false);
          return;
        }
        toast.success("Event updated.");
      } else {
        // Create (fix: provide date)
        const { error } = await supabase.from("events").insert([
          {
            title: form.title,
            description: form.description,
            image_url,
            from_date: form.from_date,
            end_date: form.end_date,
            tag: form.tag,
            date: form.from_date,
          },
        ]);
        if (error) {
          toast.error("Failed to create event: " + error.message);
          console.error("DEBUG: Insert error:", error);
          setLoading(false);
          return;
        }
        toast.success("Event created.");
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Failed to save event.", err.message);
      console.error("UNCAUGHT ERROR in event submit:", err);
    }
    setLoading(false);
  };

  // Helper for date buttons
  function DatePickerField({
    label,
    value,
    onChange,
    placeholder = "Pick a date",
    minDate,
    maxDate,
  }: {
    label: string;
    value: string | null | undefined;
    onChange: (d: Date | undefined) => void;
    placeholder?: string;
    minDate?: Date;
    maxDate?: Date;
  }) {
    const parsedVal = value ? new Date(value) : undefined;
    return (
      <div className="flex flex-col">
        <span className="font-medium mb-1 text-sm">{label}</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full sm:w-[200px] justify-start text-left font-normal",
                !parsedVal && "text-muted-foreground"
              )}
              type="button"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {parsedVal ? format(parsedVal, "PPP") : <span>{placeholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={parsedVal}
              onSelect={onChange}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
              disabled={undefined}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
          <DialogDescription>All fields required.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5 pt-1 px-1"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <div className="flex flex-col gap-4">
            <label className="font-medium text-sm" htmlFor="event-title">
              Title
            </label>
            <Input
              id="event-title"
              placeholder="Title"
              value={form.title ?? ""}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-4">
            <label className="font-medium text-sm" htmlFor="event-description">
              Description
            </label>
            <Textarea
              id="event-description"
              placeholder="Description"
              rows={4}
              value={form.description ?? ""}
              onChange={(e) => handleChange("description", e.target.value)}
              required
            />
          </div>
          <EventImageUploader
            imageFile={imageFile}
            setImageFile={setImageFile}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            onRemoveImage={() => {
              setImageFile(null);
              setImagePreview(null);
              setForm((f) => ({ ...f, image_url: "" }));
            }}
          />
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <DatePickerField
              label="From Date"
              value={form.from_date}
              onChange={(date) => handleDateChange("from_date", date)}
            />
            <DatePickerField
              label="End Date"
              value={form.end_date}
              onChange={(date) => handleDateChange("end_date", date)}
              minDate={form.from_date ? new Date(form.from_date) : undefined}
            />
          </div>
          <div className="flex flex-col gap-4">
            <label className="font-medium text-sm" htmlFor="event-tag">
              Tag <span className="text-xs text-gray-400">(optional)</span>
            </label>
            <Input
              id="event-tag"
              placeholder="Tag (e.g. Seminar, Tournament)"
              value={form.tag ?? ""}
              onChange={(e) => handleChange("tag", e.target.value)}
              maxLength={32}
            />
          </div>
          <div className="flex justify-end mt-1">
            <Button type="submit" disabled={loading} className="rounded-xl min-w-[110px]">
              {loading ? <Spinner size={16} /> : editingEvent ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminEventFormModal;

